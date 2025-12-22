import express from 'express';
import auditController from '../controllers/auditController.js';
import { authenticate } from '../middleware/auth.js';
import { isAdmin } from '../middleware/authorize.js';

const router = express.Router();

// Solo el administrador puede ver los logs de auditoría
router.get('/', authenticate, isAdmin, auditController.getAll);

export default router;
