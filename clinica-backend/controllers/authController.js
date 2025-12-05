import jwt from 'jsonwebtoken';
import { readJSON, writeJSON } from '../services/fileService.js';
import config from '../config/config.js';

const USERS_FILE = './data/users.json';

export const login = async (req, res) => {
  try {
    console.log('📨 Login request body:', req.body); // Para debug

    const { username, password } = req.body;

    // Validar que vengan los datos
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Usuario y contraseña son requeridos' 
      });
    }

    // Leer usuarios
    const users = await readJSON(USERS_FILE);
    console.log('👥 Total usuarios en DB:', users.length);

    // Buscar usuario
    const user = users.find(u => 
      u.username === username && u.password === password
    );

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Credenciales inválidas' 
      });
    }

    console.log('✅ Usuario encontrado:', user.username);

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
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
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      medicoId: user.medicoId || null,
      pacienteId: user.pacienteId || null
    };

    console.log('🎫 Token generado para:', user.username);

    res.json({
      success: true,
      message: 'Login exitoso',
      token,
      user: userData
    });

  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const users = await readJSON(USERS_FILE);
    const user = users.find(u => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }

    const userData = {
      id: user.id,
      username: user.username,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      medicoId: user.medicoId || null,
      pacienteId: user.pacienteId || null
    };

    res.json({
      success: true,
      user: userData
    });

  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error en el servidor' 
    });
  }
};