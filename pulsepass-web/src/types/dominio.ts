import { z } from 'zod';

export const esquemaCategoriaEvento = z.enum([
  'MUSIC',
  'SPORTS',
  'TECHNOLOGY',
  'EDUCATION',
  'CULTURE',
  'ENTERTAINMENT',
]);
export type CategoriaEvento = z.infer<typeof esquemaCategoriaEvento>;

export const esquemaEstadoEvento = z.enum([
  'DRAFT',
  'PUBLISHED',
  'SOLD_OUT',
  'CANCELLED',
  'FINISHED',
]);
export type EstadoEvento = z.infer<typeof esquemaEstadoEvento>;

export const esquemaTipoTicket = z.enum(['GENERAL', 'VIP', 'BACKSTAGE', 'STUDENT']);
export type TipoTicket = z.infer<typeof esquemaTipoTicket>;

export const esquemaEstadoTicket = z.enum(['RESERVED', 'PAID', 'CANCELLED', 'USED']);
export type EstadoTicket = z.infer<typeof esquemaEstadoTicket>;

/** Un badge puede representar el estado de un evento o el de un ticket. */
export type TonoBadge = EstadoEvento | EstadoTicket;

/** Modo de color de la interfaz. Sol = claro, La = oscuro. */
export const esquemaModo = z.enum(['claro', 'oscuro']);
export type Modo = z.infer<typeof esquemaModo>;

/* ------------------------------------------------------------------ */
/* Roles y sesión                                                      */
/* ------------------------------------------------------------------ */

export const esquemaRol = z.enum(['USER', 'STAFF', 'ADMIN']);
export type Rol = z.infer<typeof esquemaRol>;

/* ------------------------------------------------------------------ */
/* Respuestas de la API (contratos del backend, PRD §3.2)              */
/* Las fechas llegan como ISO local sin zona: "2026-12-12T20:00:00".   */
/* ------------------------------------------------------------------ */

export const esquemaArtista = z.object({
  id: z.number(),
  stageName: z.string(),
  country: z.string(),
  genre: z.string(),
  active: z.boolean(),
});
export type Artista = z.infer<typeof esquemaArtista>;

export const esquemaSede = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  city: z.string(),
  address: z.string(),
  capacity: z.number(),
  active: z.boolean(),
});
export type Sede = z.infer<typeof esquemaSede>;

export const esquemaResumenEvento = z.object({
  id: z.number(),
  eventCode: z.string(),
  name: z.string(),
  category: esquemaCategoriaEvento,
  status: esquemaEstadoEvento,
  eventDate: z.string(),
  venueName: z.string(),
});
export type ResumenEvento = z.infer<typeof esquemaResumenEvento>;

export const esquemaEvento = z.object({
  id: z.number(),
  eventCode: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  category: esquemaCategoriaEvento,
  status: esquemaEstadoEvento,
  eventDate: z.string(),
  minimumAge: z.number().nullish(),
  venueCode: z.string(),
  venueName: z.string(),
  artists: z.array(esquemaArtista),
});
export type Evento = z.infer<typeof esquemaEvento>;

export const esquemaTicket = z.object({
  id: z.number(),
  ticketCode: z.string(),
  type: esquemaTipoTicket,
  price: z.number(),
  status: esquemaEstadoTicket,
  purchaseDate: z.string(),
  userEmail: z.string(),
  eventCode: z.string(),
  eventName: z.string(),
});
export type Ticket = z.infer<typeof esquemaTicket>;

export const esquemaPerfilUsuario = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  active: z.boolean(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string().nullish(),
  city: z.string().nullish(),
  birthDate: z.string().nullish(),
});
export type PerfilUsuario = z.infer<typeof esquemaPerfilUsuario>;

/** POST /api/auth/login */
export const esquemaTokenRespuesta = z.object({
  accessToken: z.string().min(1),
  tokenType: z.string(),
  expiresIn: z.number(),
});
export type TokenRespuesta = z.infer<typeof esquemaTokenRespuesta>;

/** GET /api/auth/me */
export const esquemaYo = z.object({
  id: z.number().nullish(),
  identifier: z.string(),
  username: z.string(),
  email: z.string().nullish(),
  roles: z.array(esquemaRol),
});
export type Yo = z.infer<typeof esquemaYo>;

/** Contrato uniforme de errores (ErrorResponse). Solo exigimos lo necesario. */
export const esquemaErrorApi = z.object({
  status: z.number(),
  message: z.string(),
  error: z.string().nullish(),
  details: z.record(z.string(), z.string()).nullish(),
});
export type ErrorApi = z.infer<typeof esquemaErrorApi>;
