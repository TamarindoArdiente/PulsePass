import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { API, evento, sede, ticket } from '../test/datos';
import { servidor } from '../test/servidor';
import { errorApi, renderizarApp } from '../test/utilidades';

function evento200() {
  servidor.use(
    http.get(`${API}/events/${evento.eventCode}`, () => HttpResponse.json(evento)),
    http.get(`${API}/venues/${sede.code}`, () => HttpResponse.json(sede)),
  );
}

describe('Detalle de evento', () => {
  it('muestra el evento, sus artistas y la sede', async () => {
    evento200();
    renderizarApp(`/eventos/${evento.eventCode}`);

    expect(await screen.findByRole('heading', { name: 'Festival Solar', level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Solar Beat')).toBeInTheDocument();
    expect(await screen.findByText(/Bogotá/)).toBeInTheDocument();
  });

  it('un evento inexistente (o borrador) se muestra como "no disponible"', async () => {
    servidor.use(http.get(`${API}/events/NO-EXISTE`, () => errorApi(404, 'Evento no encontrado')));
    renderizarApp('/eventos/NO-EXISTE');

    expect(await screen.findByRole('heading', { name: 'Evento no disponible' })).toBeInTheDocument();
  });

  it('sin sesión se ofrece iniciar sesión en lugar de comprar', async () => {
    evento200();
    renderizarApp(`/eventos/${evento.eventCode}`);

    expect(await screen.findByRole('link', { name: 'Inicia sesión para comprar' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Comprar entrada' })).not.toBeInTheDocument();
  });

  it('STAFF no ve el panel de compra', async () => {
    evento200();
    renderizarApp(`/eventos/${evento.eventCode}`, { rol: 'STAFF' });

    expect(await screen.findByRole('link', { name: 'Ver tickets pagados' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Entradas' })).not.toBeInTheDocument();
  });

  it('un evento agotado bloquea la compra y explica por qué', async () => {
    servidor.use(
      http.get(`${API}/events/${evento.eventCode}`, () => HttpResponse.json({ ...evento, status: 'SOLD_OUT' })),
      http.get(`${API}/venues/${sede.code}`, () => HttpResponse.json(sede)),
    );
    renderizarApp(`/eventos/${evento.eventCode}`, { rol: 'USER' });

    expect(await screen.findByText('Las entradas están agotadas.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Comprar entrada' })).toBeDisabled();
  });

  it('USER compra: envía su correo y el tipo, nunca el precio, y llega a la confirmación', async () => {
    evento200();
    let cuerpo: unknown = null;
    servidor.use(
      http.post(`${API}/tickets`, async ({ request }) => {
        cuerpo = await request.json();
        return HttpResponse.json(ticket, { status: 201 });
      }),
      // Tras comprar, la caché se invalida y la confirmación vuelve a pedir el ticket.
      http.get(`${API}/tickets/${ticket.ticketCode}`, () => HttpResponse.json(ticket)),
    );
    const usuario = userEvent.setup();
    renderizarApp(`/eventos/${evento.eventCode}`, { rol: 'USER' });

    await usuario.click(await screen.findByLabelText(/VIP/));
    // Hay dos botones iguales (panel y barra móvil): basta con usar el primero.
    await usuario.click((await screen.findAllByRole('button', { name: 'Comprar entrada' }))[0]!);

    const dialogo = await screen.findByRole('dialog');
    expect(within(dialogo).getByText('ana@example.com')).toBeInTheDocument();
    await usuario.click(within(dialogo).getByRole('button', { name: 'Confirmar' }));

    expect(await screen.findByRole('heading', { name: '¡Compra realizada!' })).toBeInTheDocument();
    expect(screen.getByText('TCK-0001')).toBeInTheDocument();
    expect(cuerpo).toEqual({ userEmail: 'ana@example.com', eventCode: 'FEST-1', type: 'VIP' });
  });

  it('un 409 del servidor (regla de negocio) se muestra tal cual y permite reintentar', async () => {
    evento200();
    servidor.use(http.post(`${API}/tickets`, () => errorApi(409, 'El usuario no cumple la edad mínima del evento')));
    const usuario = userEvent.setup();
    renderizarApp(`/eventos/${evento.eventCode}`, { rol: 'USER' });

    await usuario.click((await screen.findAllByRole('button', { name: 'Comprar entrada' }))[0]!);
    const dialogo = await screen.findByRole('dialog');
    await usuario.click(within(dialogo).getByRole('button', { name: 'Confirmar' }));

    expect(await within(dialogo).findByText('El usuario no cumple la edad mínima del evento')).toBeInTheDocument();
    await waitFor(() => expect(within(dialogo).getByRole('button', { name: 'Confirmar' })).toBeEnabled());
  });
});
