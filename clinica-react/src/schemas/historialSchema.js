import { z } from 'zod';

export const historialSchema = z.object({
    pacienteId: z.string().min(1, 'Debe seleccionar un paciente'),
    medicoId: z.string().min(1, 'Debe seleccionar un médico'),
    fecha: z.string().min(1, 'La fecha es requerida'),
    diagnostico: z.string().min(3, 'El diagnóstico es requerido'),
    tratamiento: z.string().optional(),
    notas: z.string().optional()
});
