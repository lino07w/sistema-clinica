import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import crypto from 'crypto';
import config from '../config/config.js';
import { logAction } from '../utils/auditLogger.js';
import userService from '../services/userService.js';
import db from '../models/index.js';
import { sendEmail } from '../utils/emailSender.js';

const { User, Medico } = db;

/**
 * Registro de nuevos usuarios (solo médicos y recepcionistas)
 */
export const register = async (req, res) => {
  try {
    console.log('📝 Registro de usuario:', req.body);

    const { email, password, nombre, rol, ...otherData } = req.body;

    // Validar campos requeridos
    if (!email || !password || !nombre || !rol) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: email, password, nombre, rol'
      });
    }

    // VALIDACIÓN: Solo permitir médicos y recepcionistas
    if (!['medico', 'recepcionista'].includes(rol)) {
      return res.status(403).json({
        success: false,
        message: 'Solo se permite el registro de médicos y recepcionistas. Los pacientes son registrados por el personal autorizado.'
      });
    }

    // Verificar que no exista el email
    const emailExists = await User.findOne({ where: { email } });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    const newUser = await User.create({
      id: `usr-${uuidv4()}`,
      email,
      password, // En producción: hashear con bcrypt
      nombre,
      rol,
      loginType: 'email',
      estado: 'pendiente', // Requiere aprobación del admin
      fechaCreacion: new Date(),
      ultimoAcceso: null,
      ...otherData
    });

    console.log('✅ Usuario registrado (pendiente de aprobación):', newUser.email);

    // AUDIT LOG
    logAction(newUser.id, newUser.nombre, 'REGISTER', 'AUTH', `Usuario registrado con rol ${newUser.rol} (Pendiente)`);

    res.status(201).json({
      success: true,
      message: 'Registro exitoso. Tu solicitud está pendiente de aprobación por un administrador.',
      data: {
        id: newUser.id,
        email: newUser.email,
        nombre: newUser.nombre,
        rol: newUser.rol,
        estado: newUser.estado
      }
    });
  } catch (error) {
    console.error('❌ Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

/**
 * Login de usuarios (username o email)
 */
export const login = async (req, res) => {
  try {
    console.log('📨 Login request body:', req.body);

    const { usernameOrEmail, password } = req.body;

    // Validar que vengan los datos
    if (!usernameOrEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Usuario/Email y contraseña son requeridos'
      });
    }

    // Buscar usuario por email o username - FIX: Usar Op importado
    let user = await User.findOne({
      where: {
        [Op.or]: [
          { email: usernameOrEmail },
          { username: usernameOrEmail }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña con el método del modelo
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar estado del usuario
    if (user.estado !== 'activo') {
      let message = 'Tu cuenta no está activa';
      if (user.estado === 'pendiente') {
        message = 'Tu solicitud de registro está pendiente de aprobación por un administrador';
      } else if (user.estado === 'rechazado') {
        message = `Tu solicitud fue rechazada. Motivo: ${user.motivoRechazo || 'No especificado'}`;
      } else if (user.estado === 'inactivo') {
        message = 'Tu cuenta ha sido desactivada';
      }

      return res.status(403).json({
        success: false,
        message
      });
    }

    console.log('✅ Usuario encontrado:', user.username || user.email);

    // Actualizar último acceso
    await user.update({
      ultimoAcceso: new Date()
    });

    // Autovincular si es médico (asegurar que exista en medicos.json)
    if (user.rol === 'medico') {
      let medicoExistente = await Medico.findOne({
        where: {
          [Op.or]: [
            { email: user.email },
            ...(user.medicoId ? [{ id: user.medicoId }] : [])
          ]
        }
      });

      if (!medicoExistente) {
        // Crear la ficha de médico si no existe
        const newId = user.medicoId || `med-${uuidv4()}`;
        medicoExistente = await Medico.create({
          id: newId,
          nombre: user.nombre,
          email: user.email,
          telefono: user.telefono || '',
          especialidad: user.especialidad || 'General',
          matricula: user.matricula || '',
          activo: true
        });

        // Asegurar que el usuario tenga este ID vinculado
        await user.update({ medicoId: newId });
        user.medicoId = newId;
      } else if (!user.medicoId) {
        // Si existe el médico pero el usuario no tiene el ID, vincularlo
        await user.update({ medicoId: medicoExistente.id });
        user.medicoId = medicoExistente.id;
      }
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        rol: user.rol,
        medicoId: user.medicoId || null,
        pacienteId: user.pacienteId || null
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expire }
    );

    // Datos del usuario sin contraseña
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol,
      medicoId: user.medicoId,
      pacienteId: user.pacienteId,
      estado: user.estado
    };

    console.log('✅ Login exitoso:', userData);

    // AUDIT LOG
    logAction(user.id, user.nombre, 'LOGIN', 'AUTH', 'Inicio de sesión exitoso');

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: userData,
        token
      }
    });
  } catch (error) {
    console.error('❌ Error en login:', error);
    console.log('FULL ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

/**
 * Verificar token
 */
export const verifyToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token requerido'
      });
    }

    const decoded = jwt.verify(token, config.jwt.secret);

    // Buscar usuario para verificar que aún esté activo
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user || user.estado !== 'activo') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido o usuario inactivo'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          nombre: user.nombre,
          rol: user.rol,
          medicoId: user.medicoId,
          pacienteId: user.pacienteId
        }
      }
    });
  } catch (error) {
    console.error('❌ Error verificando token:', error);
    res.status(401).json({
      success: false,
      message: 'Token inválido o expirado'
    });
  }
};

/**
 * Solicitar recuperación de contraseña
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No existe un usuario con ese email'
      });
    }

    // Generar token de recuperación
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
    await user.save({ hooks: false });

    // URL para el frontend
    const resetUrl = `${req.get('origin')}/reset-password/${resetToken}`;

    const message = `Has solicitado restablecer tu contraseña. Por favor, haz clic en el siguiente enlace:\n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Recuperación de Contraseña - Sistema Clínica',
        message
      });

      res.json({
        success: true,
        message: 'Correo enviado correctamente'
      });
    } catch (err) {
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save({ hooks: false });

      console.error('Error enviando email:', err);
      return res.status(500).json({
        success: false,
        message: 'No se pudo enviar el email. Inténtalo más tarde.'
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Restablecer contraseña con token
 */
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: Date.now() }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }

    // Establecer nueva contraseña (el hook beforeUpdate la hasheará)
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save(); // Aquí SÍ disparamos hooks para que se hashee

    res.json({
      success: true,
      message: 'Contraseña actualizada correctamente'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  register,
  login,
  verifyToken,
  forgotPassword,
  resetPassword
};