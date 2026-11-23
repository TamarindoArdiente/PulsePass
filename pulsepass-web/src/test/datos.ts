import type { Artista, Evento, Rol, Sede, Ticket, Yo } from '../types/dominio';

export const API = 'http://localhost/api';

export const artista: Artista = { id: 1, stageName: 'Solar Beat', country: 'Colombia', genre: 'Electrónica', active: true };

export const sede: Sede = {
  id: 1,
  code: 'SEDE-1',
  name: 'Arena Central',
  city: 'Bogotá',
  address: 'Calle 1 # 2-3',
  capacity: 5000,
  active: true,
};

export const evento: Evento = {
  id: 1,
  eventCode: 'FEST-1',
  name: 'Festival Solar',
  description: 'Música al atardecer',
  category: 'MUSIC',
  status: 'PUBLISHED',
  eventDate: '2026-12-12T20:00:00',
  minimumAge: 18,
  venueCode: sede.code,
  venueName: sede.name,
  artists: [artista],
};

export const ticket: Ticket = {
  id: 10,
  ticketCode: 'TCK-0001',
  type: 'VIP',
  price: 250000,
  status: 'PAID',
  purchaseDate: '2026-11-20T10:00:00',
  userEmail: 'ana@example.com',
  eventCode: evento.eventCode,
  eventName: evento.name,
};

export function yo(rol: Rol): Yo {
  return { id: 7, identifier: 'ana', username: 'ana', email: 'ana@example.com', roles: [rol] };
}
