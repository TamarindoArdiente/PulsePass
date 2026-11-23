import { z } from 'zod';
import { esquemaCategoriaEvento, esquemaTipoTicket } from './dominio';


export const esquemaCredenciales = z.object({
  identifier: z.string().trim().min(1, 'Escribe tu usuario o correo.'),
  password: z.string().min(1, 'Escribe tu contraseña.'),
});
export type Credenciales = z.infer<typeof esquemaCredenciales>;

export const esquemaRegistro = z.object({
  username: z.string().trim().min(1, 'Elige un nombre de usuario.').max(100, 'Máximo 100 caracteres.'),
  email: z.email('Escribe un correo válido.').max(100, 'Máximo 100 caracteres.'),
  password: z
    .string()
    .min(12, 'Usa al menos 12 caracteres.')
    .refine((v) => new TextEncoder().encode(v).length <= 72, 'La contraseña es demasiado larga.'),
  firstName: z.string().trim().min(1, 'Escribe tu nombre.').max(50, 'Máximo 50 caracteres.'),
  lastName: z.string().trim().min(1, 'Escribe tu apellido.').max(50, 'Máximo 50 caracteres.'),
  phone: z.string().trim().max(20, 'Máximo 20 caracteres.').optional(),
  city: z.string().trim().max(50, 'Máximo 50 caracteres.').optional(),
  birthDate: z
    .string()
    .min(1, 'Indica tu fecha de nacimiento.')
    .refine((v) => new Date(v).getTime() <= Date.now(), 'La fecha no puede estar en el futuro.'),
});
export type SolicitudRegistro = z.infer<typeof esquemaRegistro>;

export const esquemaCrearEvento = z.object({
  eventCode: z.string().trim().min(1, 'Escribe un código.').max(50, 'Máximo 50 caracteres.'),
  name: z.string().trim().min(1, 'Escribe un nombre.').max(50, 'Máximo 50 caracteres.'),
  description: z.string().trim().max(2000, 'Máximo 2000 caracteres.').optional(),
  category: esquemaCategoriaEvento,
  eventDate: z.string().min(1, 'Indica fecha y hora.'),
  minimumAge: z
    .number({ error: 'Indica la edad mínima (0 si es para todo público).' })
    .int('Debe ser un número entero.')
    .min(0, 'No puede ser negativa.'),
  venueCode: z.string().min(1, 'Elige una sede.'),
});
export type SolicitudCrearEvento = z.infer<typeof esquemaCrearEvento>;

/** El email NO lo elige la persona: sale de la sesión (el backend lo verifica). */
export const esquemaCompra = z.object({
  eventCode: z.string().min(1),
  type: esquemaTipoTicket,
});
export type SolicitudCompra = z.infer<typeof esquemaCompra>;
