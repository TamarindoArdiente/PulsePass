import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { API, yo } from '../test/datos';
import { servidor } from '../test/servidor';
import { errorApi, renderizarApp } from '../test/utilidades';

describe('Login', () => {
  it('valida los campos antes de enviar', async () => {
    const usuario = userEvent.setup();
    renderizarApp('/login');

    await usuario.click(await screen.findByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('Escribe tu usuario o correo.')).toBeInTheDocument();
    expect(screen.getByText('Escribe tu contraseña.')).toBeInTheDocument();
  });

  it('muestra "Credenciales inválidas." cuando el servidor responde 401', async () => {
    servidor.use(http.post(`${API}/auth/login`, () => errorApi(401, 'Bad credentials')));
    const usuario = userEvent.setup();
    renderizarApp('/login');

    await usuario.type(await screen.findByLabelText('Usuario o correo'), 'ana');
    await usuario.type(screen.getByLabelText('Contraseña'), 'clave-incorrecta-123');
    await usuario.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('Credenciales inválidas.')).toBeInTheDocument();
  });

  it('al iniciar sesión vuelve a la página que se había pedido', async () => {
    servidor.use(
      http.post(`${API}/auth/login`, () => HttpResponse.json({ accessToken: 'token-de-prueba', tokenType: 'Bearer', expiresIn: 900 })),
      http.get(`${API}/auth/me`, () => HttpResponse.json(yo('USER'))),
      http.get(`${API}/tickets/by-user`, () => HttpResponse.json([])),
    );
    const usuario = userEvent.setup();
    // La guarda manda a /login guardando "desde: /mis-tickets".
    renderizarApp('/mis-tickets');

    await usuario.type(await screen.findByLabelText('Usuario o correo'), 'ana');
    await usuario.type(screen.getByLabelText('Contraseña'), 'una-clave-bien-larga');
    await usuario.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByRole('heading', { name: 'Mis tickets' })).toBeInTheDocument();
    expect(sessionStorage.getItem('pulsepass:token')).toBe('token-de-prueba');
  });

  it('el botón del ojo alterna mostrar y ocultar la contraseña', async () => {
    const usuario = userEvent.setup();
    renderizarApp('/login');

    const campo = await screen.findByLabelText('Contraseña');
    expect(campo).toHaveAttribute('type', 'password');
    await usuario.click(screen.getByRole('button', { name: 'Mostrar contraseña' }));
    expect(campo).toHaveAttribute('type', 'text');
    await usuario.click(screen.getByRole('button', { name: 'Ocultar contraseña' }));
    expect(campo).toHaveAttribute('type', 'password');
  });
});
