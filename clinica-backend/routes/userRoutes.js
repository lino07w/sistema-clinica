import express from 'express';
import userController from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { isAdmin } from '../middleware/authorize.js';

const router = express.Router();

// Todas las rutas requieren autenticación Y ser Admin
router.use(authenticate);
router.use(isAdmin);

// CRUD de usuarios
router.get('/', userController.getAll);
router.get('/pendientes', userController.getPendientes);
router.get('/:id', userController.getById);
router.post('/', userController.create);
router.put('/:id', userController.update);
router.delete('/:id', userController.deleteUser);

// Aprobar/Rechazar solicitudes
router.post('/:id/aprobar', userController.aprobar);
router.post('/:id/rechazar', userController.rechazar);

// Cambiar estado
router.patch('/:id/estado', userController.cambiarEstado);

export default router;