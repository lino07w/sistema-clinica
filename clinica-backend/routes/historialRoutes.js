import express from 'express';
import historialController from '../controllers/historialController.js';
import { authenticate } from '../middleware/auth.js';
import { isAdmin, isAdminOrMedico } from '../middleware/authorize.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

router.get('/', isAdminOrMedico, historialController.getAll);
router.post('/', isAdminOrMedico, historialController.create);
router.put('/:id', isAdminOrMedico, historialController.update);
router.delete('/:id', isAdmin, historialController.delete);

export default router;
