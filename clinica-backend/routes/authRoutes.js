import express from 'express';
import * as authController from '../controllers/authController.js';

const router = express.Router();

// POST /api/auth/register - Registro público
router.post('/register', authController.register);

// POST /api/auth/login - Iniciar sesión
router.post('/login', authController.login);

// POST /api/auth/verify - Verificar token
router.post('/verify', authController.verifyToken);

// POST /api/auth/forgot-password - Solicitar recuperación
router.post('/forgot-password', authController.forgotPassword);

// POST /api/auth/reset-password/:token - Restablecer contraseña
router.post('/reset-password/:token', authController.resetPassword);

export default router;