import { z } from 'zod';

export const facturaSchema = z.object({
    pacienteId: z.string().min(1, 'Debe seleccionar un paciente'),
    monto: z.coerce.number().min(0.01, 'El monto debe ser mayor a 0'),
    concepto: z.string().min(3, 'El concepto es requerido'),
    fecha: z.string().min(1, 'La fecha es requerida'),
    estado: z.string().optional()
});
