import { describe, expect, it } from 'vitest';
import { ApiError } from '../api/client';
import { erroresPorCampo, mensajeDeError, traducirMensaje } from './errores';

const error = (status: number, message = 'mensaje del servidor', detalles?: Record<string, string>) =>
  new ApiError({ status, message, detalles });

describe('mensajeDeError', () => {
  it('un 409 muestra la regla de negocio tal cual', () => {
    expect(mensajeDeError(error(409, 'El evento está agotado'))).toBe('El evento está agotado');
  });

  it('traduce las reglas de negocio conocidas del backend', () => {
    expect(mensajeDeError(error(409, 'Event has no remaining capacity: FEST-1'))).toBe('Ya no quedan entradas disponibles para este evento.');
  });

  it('un 5xx no filtra detalles internos', () => {
    expect(mensajeDeError(error(500, 'NullPointerException en TicketService'))).not.toContain('NullPointer');
  });

  it('un 401 y un 403 tienen mensajes propios', () => {
    expect(mensajeDeError(error(401))).toMatch(/sesión/i);
    expect(mensajeDeError(error(403))).toMatch(/permisos/i);
  });

  it('un error desconocido da un mensaje genérico', () => {
    expect(mensajeDeError(new Error('boom'))).toMatch(/inesperado/i);
  });
});

describe('erroresPorCampo', () => {
  it('devuelve los detalles por campo del backend', () => {
    expect(erroresPorCampo(error(400, 'x', { email: 'inválido' }))).toEqual({ email: 'inválido' });
  });

  it('con otro tipo de error devuelve un objeto vacío', () => {
    expect(erroresPorCampo(new Error('x'))).toEqual({});
  });
});

describe('traducirMensaje', () => {
  it('deja intacto un mensaje que no conoce', () => {
    expect(traducirMensaje('Mensaje nuevo del servidor')).toBe('Mensaje nuevo del servidor');
  });

  it('cada traducción reemplaza el texto en inglés', () => {
    expect(traducirMensaje('Username already exists: ana')).toBe('Ese nombre de usuario ya está registrado.');
    expect(traducirMensaje('Cannot cancel a ticket after the event date')).toMatch(/cancelar/);
  });
});
