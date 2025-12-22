import express from 'express';
import configController from '../controllers/configController.js';
import { authenticate } from '../middleware/auth.js';
import { isAdmin } from '../middleware/authorize.js';

const router = express.Router();

// Obtener config (Público o requiere auth básica? Dejémoslo público para frontend general, o auth user)
// Mejor que requiera autenticación mínima
router.get('/', authenticate, configController.get);

// Actualizar config (Solo Admin)
router.put('/', authenticate, isAdmin, configController.update);

export default router;
