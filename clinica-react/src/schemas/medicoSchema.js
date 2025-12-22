import { z } from 'zod';

export const medicoSchema = z.object({
    nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    especialidad: z.string().min(2, 'La especialidad es requerida'),
    matricula: z.string().min(1, 'La matrícula es requerida'),
    telefono: z.string().optional(),
    email: z.string().email('Email inválido').optional().or(z.literal(''))
});
