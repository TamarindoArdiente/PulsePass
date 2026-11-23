import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { API, ticket } from '../test/datos';
import { servidor } from '../test/servidor';
import { errorApi, renderizarApp } from '../test/utilidades';

describe('Mis tickets', () => {
  it('sin tickets invita a explorar la cartelera', async () => {
    servidor.use(http.get(`${API}/tickets/by-user`, () => HttpResponse.json([])));
    renderizarApp('/mis-tickets', { rol: 'USER' });

    expect(await screen.findByRole('heading', { name: 'Aún no tienes tickets' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver la cartelera' })).toBeInTheDocument();
  });

  it('pide los tickets con el correo de la sesión y filtra por estado', async () => {
    let correoPedido: string | null = null;
    servidor.use(
      http.get(`${API}/tickets/by-user`, ({ request }) => {
        correoPedido = new URL(request.url).searchParams.get('email');
        return HttpResponse.json([ticket, { ...ticket, id: 11, ticketCode: 'TCK-0002', status: 'CANCELLED', eventName: 'Otro evento' }]);
      }),
    );
    const usuario = userEvent.setup();
    renderizarApp('/mis-tickets', { rol: 'USER' });

    expect(await screen.findByText('Festival Solar')).toBeInTheDocument();
    expect(screen.getByText('Otro evento')).toBeInTheDocument();
    expect(correoPedido).toBe('ana@example.com');

    await usuario.click(screen.getByRole('button', { name: 'Cancelados' }));
    expect(screen.queryByText('Festival Solar')).not.toBeInTheDocument();
    expect(screen.getByText('Otro evento')).toBeInTheDocument();
  });

  it('cancelar un ticket pide confirmación y avisa al terminar', async () => {
    let cancelado = false;
    servidor.use(
      http.get(`${API}/tickets/${ticket.ticketCode}`, () => HttpResponse.json({ ...ticket, status: cancelado ? 'CANCELLED' : 'PAID' })),
      http.patch(`${API}/tickets/${ticket.ticketCode}/cancel`, () => {
        cancelado = true;
        return HttpResponse.json({ ...ticket, status: 'CANCELLED' });
      }),
    );
    const usuario = userEvent.setup();
    renderizarApp(`/mis-tickets/${ticket.ticketCode}`, { rol: 'USER' });

    await usuario.click(await screen.findByRole('button', { name: 'Cancelar ticket' }));
    const dialogo = await screen.findByRole('dialog');
    await usuario.click(within(dialogo).getByRole('button', { name: 'Sí, cancelar' }));

    expect(await screen.findByText('Ticket cancelado.')).toBeInTheDocument();
    // Ya cancelado: deja de ofrecerse la opción.
    expect(screen.queryByRole('button', { name: 'Cancelar ticket' })).not.toBeInTheDocument();
  });

  it('si el servidor rechaza la cancelación, muestra su mensaje', async () => {
    servidor.use(
      http.get(`${API}/tickets/${ticket.ticketCode}`, () => HttpResponse.json(ticket)),
      http.patch(`${API}/tickets/${ticket.ticketCode}/cancel`, () => errorApi(409, 'El evento ya comenzó')),
    );
    const usuario = userEvent.setup();
    renderizarApp(`/mis-tickets/${ticket.ticketCode}`, { rol: 'USER' });

    await usuario.click(await screen.findByRole('button', { name: 'Cancelar ticket' }));
    const dialogo = await screen.findByRole('dialog');
    await usuario.click(within(dialogo).getByRole('button', { name: 'Sí, cancelar' }));

    expect(await within(dialogo).findByText('El evento ya comenzó')).toBeInTheDocument();
  });
});
