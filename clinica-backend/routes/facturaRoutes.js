import express from 'express';
import facturaController from '../controllers/facturaController.js';
import { authenticate } from '../middleware/auth.js';
import { isAdmin, isAdminOrRecepcionista } from '../middleware/authorize.js';

const router = express.Router();

router.use(authenticate);

// Listar todas (Admin y Recep)
router.get('/', isAdminOrRecepcionista, facturaController.getAll);

// Crear (Admin y Recep)
router.post('/', isAdminOrRecepcionista, facturaController.create);

// Actualizar (Admin y Recep - para marcar pagada por ejemplo)
router.put('/:id', isAdminOrRecepcionista, facturaController.update);

// Eliminar (Solo Admin)
router.delete('/:id', isAdmin, facturaController.delete);

export default router;
