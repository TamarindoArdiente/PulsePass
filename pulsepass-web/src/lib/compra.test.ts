import { describe, expect, it } from 'vitest';
import type { EstadoSesion } from '../context/authContexto';
import type { Rol } from '../types/dominio';
import { accionDeCompra } from './compra';

function conRol(rol: Rol): EstadoSesion {
  return { estado: 'autenticado', usuario: { id: 1, username: 'ana', email: 'ana@example.com', roles: [rol], rol } };
}

describe('accionDeCompra', () => {
  it('espera mientras se verifica la sesión', () => {
    expect(accionDeCompra({ estado: 'cargando' }, 'PUBLISHED')).toEqual({ tipo: 'cargando' });
  });

  it('pide iniciar sesión a quien no la tiene', () => {
    expect(accionDeCompra({ estado: 'anonimo' }, 'PUBLISHED')).toEqual({ tipo: 'anonimo' });
  });

  it('permite comprar a USER en un evento publicado', () => {
    expect(accionDeCompra(conRol('USER'), 'PUBLISHED')).toEqual({ tipo: 'permitido' });
  });

  it('oculta la compra a STAFF y ADMIN', () => {
    expect(accionDeCompra(conRol('STAFF'), 'PUBLISHED')).toEqual({ tipo: 'oculto' });
    expect(accionDeCompra(conRol('ADMIN'), 'PUBLISHED')).toEqual({ tipo: 'oculto' });
  });

  it.each(['DRAFT', 'SOLD_OUT', 'CANCELLED', 'FINISHED'] as const)('bloquea la compra si el evento está %s', (estado) => {
    const accion = accionDeCompra(conRol('USER'), estado);
    expect(accion.tipo).toBe('bloqueado');
  });

  it('un evento no publicado bloquea incluso a quien no inició sesión', () => {
    expect(accionDeCompra({ estado: 'anonimo' }, 'SOLD_OUT').tipo).toBe('bloqueado');
  });
});
