/**
 * Todas las rutas de la app en un solo lugar (FE-003): nunca se escriben strings sueltos.
 * `PATRONES` se usa al declarar el router; `RUTAS` para navegar y construir enlaces.
 */
export const PATRONES = {
  inicio: '/',
  eventos: '/eventos',
  evento: '/eventos/:eventCode',
  artistas: '/artistas',
  artista: '/artistas/:id',
  sedes: '/sedes',
  sede: '/sedes/:code',
  login: '/login',
  registro: '/registro',
  cuenta: '/cuenta',
  misTickets: '/mis-tickets',
  ticket: '/mis-tickets/:ticketCode',
  confirmacion: '/compra/confirmacion/:ticketCode',
  staffValidacion: '/staff/validacion',
  staffTickets: '/staff/eventos/:eventCode/tickets',
  adminEventos: '/admin/eventos',
  adminNuevo: '/admin/eventos/nuevo',
  adminEvento: '/admin/eventos/:eventCode',
  sinPermisos: '/403',
} as const;

const c = encodeURIComponent;

export const RUTAS = {
  inicio: PATRONES.inicio,
  eventos: PATRONES.eventos,
  evento: (eventCode: string) => `/eventos/${c(eventCode)}`,
  /** Cartelera filtrada por artista: /eventos?artista=Solar%20Beat */
  eventosDeArtista: (stageName: string) => `/eventos?artista=${c(stageName)}`,
  artistas: PATRONES.artistas,
  artista: (id: number | string) => `/artistas/${c(String(id))}`,
  sedes: PATRONES.sedes,
  sede: (code: string) => `/sedes/${c(code)}`,
  login: PATRONES.login,
  registro: PATRONES.registro,
  cuenta: PATRONES.cuenta,
  misTickets: PATRONES.misTickets,
  ticket: (ticketCode: string) => `/mis-tickets/${c(ticketCode)}`,
  confirmacion: (ticketCode: string) => `/compra/confirmacion/${c(ticketCode)}`,
  staffValidacion: PATRONES.staffValidacion,
  staffTickets: (eventCode: string) => `/staff/eventos/${c(eventCode)}/tickets`,
  adminEventos: PATRONES.adminEventos,
  adminNuevo: PATRONES.adminNuevo,
  adminEvento: (eventCode: string) => `/admin/eventos/${c(eventCode)}`,
  sinPermisos: PATRONES.sinPermisos,
} as const;
