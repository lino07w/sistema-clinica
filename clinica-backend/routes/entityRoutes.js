import express from 'express';
import pacienteController from '../controllers/pacienteController.js';
import medicoController from '../controllers/medicoController.js';
import citaController from '../controllers/citaController.js';
import { authenticate } from '../middleware/auth.js';
import { isAdmin, isAdminOrRecepcionista, isAdminOrMedico, isStaff } from '../middleware/authorize.js';

const pacienteRouter = express.Router();
const medicoRouter = express.Router();
const citaRouter = express.Router();

// Todas las rutas requieren autenticación
pacienteRouter.use(authenticate);
medicoRouter.use(authenticate);
citaRouter.use(authenticate);

/* ===================== PACIENTES ===================== */
// El personal (Admin, Médicos, Recepcionistas) puede ver lista y detalles
pacienteRouter.get('/', isStaff, pacienteController.getAll);
pacienteRouter.get('/:id', isStaff, pacienteController.getById);

// Admin y Recepcionista pueden crear y actualizar
pacienteRouter.post('/', isAdminOrRecepcionista, pacienteController.create);
pacienteRouter.put('/:id', isAdminOrRecepcionista, pacienteController.update);

// Solo Admin puede eliminar
pacienteRouter.delete('/:id', isAdmin, pacienteController.delete);

/* ===================== MÉDICOS ===================== */
// Todos pueden ver la lista de médicos
medicoRouter.get('/', medicoController.getAll);
medicoRouter.get('/:id', medicoController.getById);

// Solo Admin puede gestionar médicos
medicoRouter.post('/', isAdmin, medicoController.create);
medicoRouter.put('/:id', isAdmin, medicoController.update);
medicoRouter.delete('/:id', isAdmin, medicoController.delete);

/* ===================== CITAS ===================== */
// Admin, Recepcionista y Médico pueden ver citas (filtradas por rol)
citaRouter.get('/', citaController.getAll);
citaRouter.get('/:id', citaController.getById);

// Admin y Recepcionista pueden crear citas
citaRouter.post('/', isAdminOrRecepcionista, citaController.create);

// Admin, Recepcionista y Médico pueden actualizar citas
citaRouter.put('/:id', isAdminOrMedico, citaController.update);

// Solo Admin puede eliminar citas
citaRouter.delete('/:id', isAdmin, citaController.delete);

export { pacienteRouter, medicoRouter, citaRouter };