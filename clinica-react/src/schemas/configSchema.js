import { z } from 'zod';

// Los nombres coinciden con el modelo Config del backend.
export const configSchema = z.object({
  nombreClinica: z.string().trim().min(1, 'Escribe el nombre de la clínica'),
  direccion: z.string().optional().nullable(),
  telefono: z.string().optional().nullable(),
  email: z.string().email('Escribe un email válido').optional().nullable().or(z.literal('')),
  horarioAtencion: z.string().optional().nullable(),
});
