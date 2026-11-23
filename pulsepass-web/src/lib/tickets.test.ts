import { describe, expect, it } from 'vitest';
import type { EstadoTicket, Ticket } from '../types/dominio';
import { filtrarTickets, sePuedeCancelar } from './tickets';

function ticket(id: number, status: EstadoTicket, purchaseDate: string): Ticket {
  return {
    id,
    ticketCode: `T-${id}`,
    type: 'GENERAL',
    price: 1000,
    status,
    purchaseDate,
    userEmail: 'ana@example.com',
    eventCode: 'E',
    eventName: 'Evento',
  };
}

const lista = [ticket(1, 'PAID', '2026-01-01T10:00:00'), ticket(2, 'USED', '2026-03-01T10:00:00'), ticket(3, 'PAID', '2026-02-01T10:00:00')];

describe('filtrarTickets', () => {
  it('TODOS devuelve todo, del más reciente al más antiguo', () => {
    expect(filtrarTickets(lista, 'TODOS').map((t) => t.id)).toEqual([2, 3, 1]);
  });

  it('filtra por estado', () => {
    expect(filtrarTickets(lista, 'PAID').map((t) => t.id)).toEqual([3, 1]);
    expect(filtrarTickets(lista, 'CANCELLED')).toEqual([]);
  });
});

describe('sePuedeCancelar', () => {
  it('solo se ofrece para reservados y pagados', () => {
    expect(sePuedeCancelar(ticket(1, 'RESERVED', 'x'))).toBe(true);
    expect(sePuedeCancelar(ticket(1, 'PAID', 'x'))).toBe(true);
    expect(sePuedeCancelar(ticket(1, 'USED', 'x'))).toBe(false);
    expect(sePuedeCancelar(ticket(1, 'CANCELLED', 'x'))).toBe(false);
  });
});
