import { z } from 'zod';

export const citaSchema = z.object({
    pacienteId: z.string().min(1, 'Debe seleccionar un paciente'),
    medicoId: z.string().min(1, 'Debe seleccionar un médico'), // Solo para admin/recepcionista, medicoId puede ser opcional si es el user
    fecha: z.string().min(1, 'La fecha es requerida'), // Podríamos validar que no sea pasada
    hora: z.string().min(1, 'La hora es requerida'),
    motivo: z.string().optional(),
    estado: z.string().optional()
});
