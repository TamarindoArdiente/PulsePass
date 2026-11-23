import type { EstadoTicket, Ticket } from '../types/dominio';

export type FiltroTickets = 'TODOS' | EstadoTicket;

export const FILTROS_TICKETS: readonly { valor: FiltroTickets; etiqueta: string }[] = [
  { valor: 'TODOS', etiqueta: 'Todos' },
  { valor: 'PAID', etiqueta: 'Pagados' },
  { valor: 'USED', etiqueta: 'Usados' },
  { valor: 'CANCELLED', etiqueta: 'Cancelados' },
];

/** Más recientes primero; el filtro "TODOS" no descarta nada. */
export function filtrarTickets(tickets: readonly Ticket[], filtro: FiltroTickets): Ticket[] {
  return tickets
    .filter((t) => filtro === 'TODOS' || t.status === filtro)
    .toSorted((a, b) => b.purchaseDate.localeCompare(a.purchaseDate));
}

/**
 * Solo decide si se OFRECE el botón; el backend sigue siendo quien valida
 * (si no corresponde, responde 409 y se muestra su mensaje).
 */
export function sePuedeCancelar(ticket: Ticket): boolean {
  return ticket.status === 'RESERVED' || ticket.status === 'PAID';
}
