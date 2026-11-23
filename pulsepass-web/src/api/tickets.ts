import { z } from 'zod';
import { esquemaTicket, type TipoTicket } from '../types/dominio';
import { construirRuta, request } from './client';

const c = encodeURIComponent;

/** POST /api/tickets (rol USER). El precio lo fija el backend: la UI no lo envía ni lo calcula (GAP-06). */
export const comprarTicket = (datos: { userEmail: string; eventCode: string; type: TipoTicket }) =>
  request('/api/tickets', { metodo: 'POST', cuerpo: datos, esquema: esquemaTicket });

/** GET /api/tickets/by-user?email= (propios; ADMIN puede ver cualquiera) */
export const obtenerTicketsDeUsuario = (email: string) =>
  request(construirRuta('/api/tickets/by-user', { email }), { esquema: z.array(esquemaTicket) });

/** GET /api/tickets/{ticketCode} (dueño, STAFF o ADMIN) */
export const obtenerTicket = (ticketCode: string) =>
  request(`/api/tickets/${c(ticketCode)}`, { esquema: esquemaTicket });

/** PATCH /api/tickets/{ticketCode}/cancel (solo el dueño) */
export const cancelarTicket = (ticketCode: string) =>
  request(`/api/tickets/${c(ticketCode)}/cancel`, { metodo: 'PATCH', esquema: esquemaTicket });

/** PATCH /api/tickets/{ticketCode}/use (STAFF/ADMIN) */
export const marcarTicketUsado = (ticketCode: string) =>
  request(`/api/tickets/${c(ticketCode)}/use`, { metodo: 'PATCH', esquema: esquemaTicket });

/** GET /api/events/{eventCode}/tickets/paid (STAFF/ADMIN) */
export const obtenerTicketsPagados = (eventCode: string) =>
  request(`/api/events/${c(eventCode)}/tickets/paid`, { esquema: z.array(esquemaTicket) });
