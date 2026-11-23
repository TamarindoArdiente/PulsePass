import { afterEach, describe, expect, it } from 'vitest';
import { z } from 'zod';
import { ApiError, request } from './client';

const fetchOriginal = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = fetchOriginal;
});

async function intentar() {
  try {
    await request('/api/x', { esquema: z.object({ ok: z.boolean() }) });
    return null;
  } catch (e) {
    return e;
  }
}

describe('request', () => {
  it('un 500 sin cuerpo (el proxy no alcanzó al backend) se trata como "sin conexión"', async () => {
    globalThis.fetch = () => Promise.resolve(new Response('', { status: 500 }));
    const error = await intentar();
    expect(error instanceof ApiError).toBe(true);
    expect((error as ApiError).status).toBe(0);
    expect((error as ApiError).message).toMatch(/backend/i);
  });

  it('un 500 con el cuerpo de error del backend conserva su estado', async () => {
    globalThis.fetch = () =>
      Promise.resolve(Response.json({ status: 500, message: 'Internal error' }, { status: 500 }));
    const error = await intentar();
    expect((error as ApiError).status).toBe(500);
  });

  it('un 409 conserva el mensaje del servidor', async () => {
    globalThis.fetch = () => Promise.resolve(Response.json({ status: 409, message: 'Regla de negocio' }, { status: 409 }));
    const error = await intentar();
    expect((error as ApiError).status).toBe(409);
    expect((error as ApiError).message).toBe('Regla de negocio');
  });

  it('si fetch falla (sin red) responde con estado 0', async () => {
    globalThis.fetch = () => Promise.reject(new TypeError('Failed to fetch'));
    const error = await intentar();
    expect((error as ApiError).status).toBe(0);
  });
});
