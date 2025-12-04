/**
 * Utilidades para manejo de JWT
 */

import jwt from 'jsonwebtoken';
import config from '../config/config.js';

/**
 * Genera un token JWT
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expire
  });
};

/**
 * Verifica un token JWT
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    return null;
  }
};

/**
 * Decodifica un token sin verificar (útil para debug)
 */
export const decodeToken = (token) => {
  return jwt.decode(token);
};
