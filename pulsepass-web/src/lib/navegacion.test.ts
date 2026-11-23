import { describe, expect, it } from 'vitest';
import { destinoSeguro, leerEstadoNavegacion } from './navegacion';

describe('destinoSeguro', () => {
  it('acepta rutas internas', () => {
    expect(destinoSeguro('/mis-tickets')).toBe('/mis-tickets');
    expect(destinoSeguro('/eventos?q=sol')).toBe('/eventos?q=sol');
  });

  it.each(['//otro-sitio.com', 'https://otro-sitio.com', 'javascript:alert(1)', ''])('rechaza "%s"', (destino) => {
    expect(destinoSeguro(destino)).toBe('/');
  });

  it('sin destino vuelve al inicio', () => {
    expect(destinoSeguro(undefined)).toBe('/');
  });
});

describe('leerEstadoNavegacion', () => {
  it('lee un estado válido', () => {
    expect(leerEstadoNavegacion({ desde: '/cuenta', registrado: true })).toEqual({ desde: '/cuenta', registrado: true });
  });

  it('ignora lo que no tiene la forma esperada', () => {
    expect(leerEstadoNavegacion(null)).toEqual({});
    expect(leerEstadoNavegacion({ desde: 42 })).toEqual({});
    expect(leerEstadoNavegacion('texto')).toEqual({});
  });
});
