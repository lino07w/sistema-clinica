/**
 * Servicio de Autenticación
 * Maneja la lógica de negocio de autenticación
 */

import bcrypt from 'bcryptjs';
import storage from '../utils/fileStorage.js';
import { generateToken } from '../utils/jwt.js';
import config from '../config/config.js';

class AuthService {
  /**
   * Login de usuario
   */
  async login(username, password) {
    // Por ahora validamos contra el admin por defecto
    // En producción esto buscaría en la BD de usuarios
    
    if (username === config.defaultAdmin.username && 
        password === config.defaultAdmin.password) {
      
      // Generar token JWT
      const token = generateToken({
        id: 'admin',
        username: username,
        role: 'admin'
      });

      return {
        user: {
          id: 'admin',
          username: username,
          role: 'admin'
        },
        token
      };
    }

    // También verificar contra usuarios registrados en el futuro
    const users = await storage.read('usuarios');
    const user = users.find(u => u.username === username);

    if (!user) {
      throw new Error('Usuario o contraseña incorrectos');
    }

    // Verificar contraseña hasheada
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Usuario o contraseña incorrectos');
    }

    // Generar token
    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role || 'user'
    });

    return {
      user: {
        id: user.id,
        username: user.username,
        role: user.role || 'user'
      },
      token
    };
  }

  /**
   * Registrar nuevo usuario (para futuro)
   */
  async register(userData) {
    // Verificar si el usuario ya existe
    const existingUser = await storage.findOne('usuarios', { 
      username: userData.username 
    });

    if (existingUser) {
      throw new Error('El usuario ya existe');
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Crear usuario
    const newUser = await storage.create('usuarios', {
      username: userData.username,
      password: hashedPassword,
      email: userData.email,
      role: userData.role || 'user'
    });

    // Generar token
    const token = generateToken({
      id: newUser.id,
      username: newUser.username,
      role: newUser.role
    });

    return {
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      },
      token
    };
  }

  /**
   * Obtener información del usuario actual
   */
  async getCurrentUser(userId) {
    if (userId === 'admin') {
      return {
        id: 'admin',
        username: config.defaultAdmin.username,
        role: 'admin'
      };
    }

    const user = await storage.findById('usuarios', userId);
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };
  }
}

export default new AuthService();
