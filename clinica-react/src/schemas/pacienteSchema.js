import { z } from 'zod';

export const pacienteSchema = z.object({
    nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    dni: z.string().min(5, 'El DNI debe ser válido'),
    fechaNacimiento: z.string().optional(),
    genero: z.enum(['Masculino', 'Femenino', 'Otro', 'No especificado'], { invalid_type_error: 'Género inválido' }).or(z.string()).refine(v => !!v, { message: 'El género es obligatorio' }),
    telefono: z.string().optional(),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    direccion: z.string().optional()
});
