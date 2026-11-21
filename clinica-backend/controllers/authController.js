/**
 * Controlador de Autenticación
 *
 * Responsable de registro, login, verificación de token y recuperación
 * de contraseña. Los errores se propagan al middleware central mediante
 * `asyncHandler` + `ApiError`, por lo que nunca se filtran detalles
 * internos al cliente.
 */

import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import config from '../config/config.js';
import db from '../models/index.js';
import { logAction } from '../utils/auditLogger.js';
import { sendEmail } from '../utils/emailSender.js';
import { generateToken, verifyToken as verifyJwt } from '../utils/jwt.js';
import { successResponse } from '../utils/response.js';
import { ApiError, asyncHandler } from '../middleware/errorHandler.js';

const { User, Medico } = db;

/** Roles que pueden auto-registrarse (quedan pendientes de aprobación). */
const SELF_REGISTER_ROLES = ['medico', 'recepcionista'];

/** Campos opcionales que un usuario puede enviar al registrarse. */
const SELF_REGISTER_OPTIONAL_FIELDS = ['username', 'telefono', 'especialidad', 'matricula'];

const MIN_PASSWORD_LENGTH = 6;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora

/** Hash SHA-256 para no guardar tokens de recuperación en texto plano. */
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

/** Selecciona sólo las claves permitidas de un objeto (evita mass assignment). */
const pick = (source, keys) =>
  keys.reduce((acc, key) => {
    if (source[key] !== undefined && source[key] !== '') acc[key] = source[key];
    return acc;
  }, {});

/** Representación pública del usuario (sin datos sensibles). */
const toPublicUser = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  nombre: user.nombre,
  rol: user.rol,
  medicoId: user.medicoId,
  pacienteId: user.pacienteId,
  estado: user.estado
});

const INACTIVE_MESSAGES = {
  pendiente: 'Tu solicitud de registro está pendiente de aprobación por un administrador',
  inactivo: 'Tu cuenta ha sido desactivada'
};

/**
 * Garantiza que un usuario con rol médico tenga su ficha en la tabla `medicos`
 * y que ambos registros queden vinculados.
 */
const ensureMedicoProfile = async (user) => {
  const medico = await Medico.findOne({
    where: {
      [Op.or]: [{ email: user.email }, ...(user.medicoId ? [{ id: user.medicoId }] : [])]
    }
  });

  if (medico) {
    if (!user.medicoId) await user.update({ medicoId: medico.id });
    return;
  }

  const medicoId = user.medicoId || `med-${uuidv4()}`;
  await Medico.create({
    id: medicoId,
    nombre: user.nombre,
    email: user.email,
    telefono: user.telefono || '',
    especialidad: user.especialidad || 'General',
    matricula: user.matricula || '',
    activo: true
  });
  await user.update({ medicoId });
};

/**
 * POST /api/auth/register
 * Registro público de médicos y recepcionistas. La cuenta queda `pendiente`
 * hasta que un administrador la apruebe.
 */
export const register = asyncHandler(async (req, res) => {
  const { email, password, nombre, rol } = req.body;

  if (!email || !password || !nombre || !rol) {
    throw new ApiError('Faltan campos requeridos: email, password, nombre, rol', 400);
  }
  if (!SELF_REGISTER_ROLES.includes(rol)) {
    throw new ApiError(
      'Solo se permite el registro de médicos y recepcionistas. Los pacientes son registrados por el personal autorizado.',
      403
    );
  }
  if (String(password).length < MIN_PASSWORD_LENGTH) {
    throw new ApiError(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`, 400);
  }
  if (await User.findOne({ where: { email } })) {
    throw new ApiError('El email ya está registrado', 409);
  }

  // Sólo se aceptan campos explícitos: `estado`, `medicoId`, etc. no pueden
  // ser enviados por el cliente para saltarse la aprobación.
  const newUser = await User.create({
    ...pick(req.body, SELF_REGISTER_OPTIONAL_FIELDS),
    id: `usr-${uuidv4()}`,
    email,
    password,
    nombre,
    rol,
    loginType: 'email',
    estado: 'pendiente',
    fechaCreacion: new Date(),
    ultimoAcceso: null
  });

  logAction(newUser.id, newUser.nombre, 'REGISTER', 'AUTH', `Usuario registrado con rol ${newUser.rol} (Pendiente)`);

  successResponse(
    res,
    toPublicUser(newUser),
    'Registro exitoso. Tu solicitud está pendiente de aprobación por un administrador.',
    201
  );
});

/**
 * POST /api/auth/login
 * Login con username o email.
 */
export const login = asyncHandler(async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  if (!usernameOrEmail || !password) {
    throw new ApiError('Usuario/Email y contraseña son requeridos', 400);
  }

  const user = await User.findOne({
    where: { [Op.or]: [{ email: usernameOrEmail }, { username: usernameOrEmail }] }
  });

  // Mismo mensaje para usuario inexistente o contraseña errónea: evita
  // enumeración de usuarios.
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError('Credenciales inválidas', 401);
  }

  if (user.estado !== 'activo') {
    const message =
      user.estado === 'rechazado'
        ? `Tu solicitud fue rechazada. Motivo: ${user.motivoRechazo || 'No especificado'}`
        : INACTIVE_MESSAGES[user.estado] || 'Tu cuenta no está activa';
    throw new ApiError(message, 403);
  }

  await user.update({ ultimoAcceso: new Date() });
  if (user.rol === 'medico') await ensureMedicoProfile(user);

  const token = generateToken({
    id: user.id,
    username: user.username,
    email: user.email,
    rol: user.rol,
    medicoId: user.medicoId || null,
    pacienteId: user.pacienteId || null
  });

  logAction(user.id, user.nombre, 'LOGIN', 'AUTH', 'Inicio de sesión exitoso');

  successResponse(res, { user: toPublicUser(user), token }, 'Login exitoso');
});

/**
 * POST /api/auth/verify
 * Verifica un token y que el usuario siga activo.
 */
export const verifyToken = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) throw new ApiError('Token requerido', 400);

  const decoded = verifyJwt(token);
  const user = decoded && (await User.findByPk(decoded.id));

  if (!user || user.estado !== 'activo') {
    throw new ApiError('Token inválido o usuario inactivo', 401);
  }

  successResponse(res, { user: toPublicUser(user) }, 'Token válido');
});

/**
 * POST /api/auth/forgot-password
 * Siempre responde igual exista o no el email (evita enumeración).
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const genericMessage = 'Si el email está registrado, recibirás un enlace para restablecer tu contraseña';
  const { email } = req.body;
  if (!email) throw new ApiError('El email es requerido', 400);

  const user = await User.findOne({ where: { email } });
  if (!user) return successResponse(res, null, genericMessage);

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = hashToken(resetToken);
  user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  await user.save({ hooks: false });

  // La URL se construye con un valor de configuración, nunca con cabeceras
  // del request (evita Host/Origin header injection).
  const resetUrl = `${config.frontendUrl}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Recuperación de Contraseña - Sistema Clínica',
      message: `Has solicitado restablecer tu contraseña. Abre el siguiente enlace (válido 1 hora):\n\n${resetUrl}`
    });
  } catch (err) {
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save({ hooks: false });
    console.error('Error enviando email de recuperación:', err.message);
    throw new ApiError('No se pudo enviar el email. Inténtalo más tarde.', 502);
  }

  successResponse(res, null, genericMessage);
});

/**
 * POST /api/auth/reset-password/:token
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  if (!password || String(password).length < MIN_PASSWORD_LENGTH) {
    throw new ApiError(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`, 400);
  }

  const user = await User.findOne({
    where: {
      resetPasswordToken: hashToken(req.params.token),
      resetPasswordExpires: { [Op.gt]: new Date() }
    }
  });
  if (!user) throw new ApiError('Token inválido o expirado', 400);

  // El hook beforeUpdate se encarga de hashear la nueva contraseña.
  user.password = password;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  logAction(user.id, user.nombre, 'RESET_PASSWORD', 'AUTH', 'Contraseña restablecida');
  successResponse(res, null, 'Contraseña actualizada correctamente');
});

export default {
  register,
  login,
  verifyToken,
  forgotPassword,
  resetPassword
};
