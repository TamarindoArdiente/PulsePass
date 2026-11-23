import { describe, expect, it } from 'vitest';
import { fortalezaContrasena } from './contrasena';

describe('fortalezaContrasena', () => {
  it('una clave corta es débil', () => {
    expect(fortalezaContrasena('abc').nivel).toBe('debil');
  });

  it('12 letras minúsculas siguen siendo débiles', () => {
    expect(fortalezaContrasena('abcdefghijkl').nivel).toBe('debil');
  });

  it('larga, con mayúsculas, números y símbolos es fuerte', () => {
    expect(fortalezaContrasena('Pulse-Pass-2026-Segura!').nivel).toBe('fuerte');
  });

  it('el puntaje nunca supera 5', () => {
    expect(fortalezaContrasena('Aa1!Aa1!Aa1!Aa1!Aa1!').puntos).toBeLessThanOrEqual(5);
  });
});
