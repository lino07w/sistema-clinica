import { z } from 'zod';

export const configSchema = z.object({
    nombre: z.string().min(1, 'El nombre de la clínica es requerido'),
    direccion: z.string().optional(),
    telefono: z.string().optional(),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    moneda: z.string().optional()
});
