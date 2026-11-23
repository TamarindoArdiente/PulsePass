import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { API } from './test/datos';
import { servidor } from './test/servidor';
import { renderizarApp } from './test/utilidades';

describe('guardas de ruta', () => {
  it('una persona sin sesión que pide una ruta protegida va a iniciar sesión', async () => {
    renderizarApp('/mis-tickets');
    expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument();
  });

  it('un USER no entra a las rutas de administración', async () => {
    renderizarApp('/admin/eventos', { rol: 'USER' });
    expect(await screen.findByRole('heading', { name: /no tienes permisos/i })).toBeInTheDocument();
  });

  it('un USER no entra a la validación de ingreso del personal', async () => {
    renderizarApp('/staff/validacion', { rol: 'USER' });
    expect(await screen.findByRole('heading', { name: /no tienes permisos/i })).toBeInTheDocument();
  });

  it('un ADMIN sí entra al panel de administración', async () => {
    servidor.use(http.get(`${API}/events/published`, () => HttpResponse.json([])));
    renderizarApp('/admin/eventos', { rol: 'ADMIN' });
    expect(await screen.findByRole('heading', { name: 'Administrar eventos' })).toBeInTheDocument();
  });

  it('con sesión iniciada, /login redirige al inicio', async () => {
    servidor.use(
      http.get(`${API}/events/published`, () => HttpResponse.json([])),
      http.get(`${API}/artists/active`, () => HttpResponse.json([])),
    );
    renderizarApp('/login', { rol: 'USER' });
    expect(await screen.findByRole('heading', { name: 'Descubre los mejores eventos' })).toBeInTheDocument();
  });

  it('una dirección inexistente muestra "Página no encontrada"', async () => {
    renderizarApp('/esto-no-existe');
    expect(await screen.findByRole('heading', { name: 'Página no encontrada' })).toBeInTheDocument();
  });
});
