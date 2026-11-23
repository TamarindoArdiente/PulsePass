import { describe, expect, it } from 'vitest';
import type { ResumenEvento } from '../types/dominio';
import { filtrarEventos, normalizar } from './filtrosEventos';

const base = { id: 0, status: 'PUBLISHED', venueName: 'Arena' } as const;
const eventos: ResumenEvento[] = [
  { ...base, id: 1, eventCode: 'A', name: 'Festival de Música', category: 'MUSIC', eventDate: '2026-12-20T20:00:00' },
  { ...base, id: 2, eventCode: 'B', name: 'Maratón Urbana', category: 'SPORTS', eventDate: '2026-11-01T08:00:00' },
  { ...base, id: 3, eventCode: 'C', name: 'Cumbre Tech', category: 'TECHNOLOGY', eventDate: '2026-12-01T09:00:00' },
];

describe('normalizar', () => {
  it('pasa a minúsculas y quita tildes', () => {
    expect(normalizar('  MÚSICA Árbol ')).toBe('musica arbol');
  });
});

describe('filtrarEventos', () => {
  it('sin filtros devuelve todo, ordenado por fecha', () => {
    expect(filtrarEventos(eventos, { q: '', categoria: null }).map((e) => e.eventCode)).toEqual(['B', 'C', 'A']);
  });

  it('busca sin importar tildes ni mayúsculas', () => {
    expect(filtrarEventos(eventos, { q: 'musica', categoria: null }).map((e) => e.eventCode)).toEqual(['A']);
  });

  it('filtra por categoría', () => {
    expect(filtrarEventos(eventos, { q: '', categoria: 'SPORTS' }).map((e) => e.eventCode)).toEqual(['B']);
  });

  it('combina texto y categoría', () => {
    expect(filtrarEventos(eventos, { q: 'tech', categoria: 'MUSIC' })).toEqual([]);
  });

  it('no modifica la lista original', () => {
    const copia = eventos.map((e) => e.eventCode);
    filtrarEventos(eventos, { q: '', categoria: null });
    expect(eventos.map((e) => e.eventCode)).toEqual(copia);
  });
});
