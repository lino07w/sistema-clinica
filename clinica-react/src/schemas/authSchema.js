import { z } from 'zod';

export const loginSchema = z.object({
    identificador: z.string().min(1, 'El usuario o email es requerido'),
    password: z.string().min(1, 'La contraseña es requerida')
});
