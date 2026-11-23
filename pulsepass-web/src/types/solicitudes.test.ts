import { describe, expect, it } from 'vitest';
import { esquemaCompra, esquemaCrearEvento, esquemaCredenciales, esquemaRegistro } from './solicitudes';

const registroValido = {
  username: 'ana',
  email: 'ana@example.com',
  password: 'una-clave-bien-larga',
  firstName: 'Ana',
  lastName: 'Pérez',
  birthDate: '1999-05-20',
};

describe('esquemaCredenciales', () => {
  it('exige usuario y contraseña', () => {
    expect(esquemaCredenciales.safeParse({ identifier: '', password: '' }).success).toBe(false);
    expect(esquemaCredenciales.safeParse({ identifier: 'ana', password: 'x' }).success).toBe(true);
  });
});

describe('esquemaRegistro', () => {
  it('acepta un registro válido', () => {
    expect(esquemaRegistro.safeParse(registroValido).success).toBe(true);
  });

  it('rechaza contraseñas de menos de 12 caracteres', () => {
    expect(esquemaRegistro.safeParse({ ...registroValido, password: 'corta-123' }).success).toBe(false);
  });

  it('rechaza contraseñas de más de 72 bytes', () => {
    expect(esquemaRegistro.safeParse({ ...registroValido, password: 'a'.repeat(73) }).success).toBe(false);
    // 40 caracteres de 2 bytes = 80 bytes: pasa el largo en caracteres pero no el de bytes.
    expect(esquemaRegistro.safeParse({ ...registroValido, password: 'ñ'.repeat(40) }).success).toBe(false);
  });

  it('rechaza correos inválidos y fechas futuras', () => {
    expect(esquemaRegistro.safeParse({ ...registroValido, email: 'no-es-correo' }).success).toBe(false);
    expect(esquemaRegistro.safeParse({ ...registroValido, birthDate: '2999-01-01' }).success).toBe(false);
  });
});

describe('esquemaCrearEvento', () => {
  const valido = { eventCode: 'FEST-1', name: 'Festival', category: 'MUSIC', eventDate: '2026-12-12T20:00', minimumAge: 0, venueCode: 'SEDE-1' };

  it('acepta un evento válido', () => {
    expect(esquemaCrearEvento.safeParse(valido).success).toBe(true);
  });

  it('exige sede y rechaza edad negativa o no numérica', () => {
    expect(esquemaCrearEvento.safeParse({ ...valido, venueCode: '' }).success).toBe(false);
    expect(esquemaCrearEvento.safeParse({ ...valido, minimumAge: -1 }).success).toBe(false);
    expect(esquemaCrearEvento.safeParse({ ...valido, minimumAge: Number.NaN }).success).toBe(false);
  });
});

describe('esquemaCompra', () => {
  it('no admite un tipo de entrada inventado', () => {
    expect(esquemaCompra.safeParse({ eventCode: 'E', type: 'VIP' }).success).toBe(true);
    expect(esquemaCompra.safeParse({ eventCode: 'E', type: 'GRATIS' }).success).toBe(false);
  });
});
