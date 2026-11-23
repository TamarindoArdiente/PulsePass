import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { API, evento, ticket } from '../test/datos';
import { servidor } from '../test/servidor';
import { renderizarApp } from '../test/utilidades';

describe('Panel de personal', () => {
  it('lista los tickets pagados y marca uno como usado', async () => {
    let usados = 0;
    servidor.use(
      http.get(`${API}/events/${evento.eventCode}`, () => HttpResponse.json(evento)),
      http.get(`${API}/events/${evento.eventCode}/tickets/paid`, () => HttpResponse.json(usados === 0 ? [ticket] : [])),
      http.patch(`${API}/tickets/${ticket.ticketCode}/use`, () => {
        usados += 1;
        return HttpResponse.json({ ...ticket, status: 'USED' });
      }),
    );
    const usuario = userEvent.setup();
    renderizarApp(`/staff/eventos/${evento.eventCode}/tickets`, { rol: 'STAFF' });

    const tabla = await screen.findByRole('table');
    expect(within(tabla).getByText('TCK-0001')).toBeInTheDocument();

    await usuario.click(screen.getByRole('button', { name: /marcar como usado el ticket TCK-0001/i }));

    expect(await screen.findByText(/TCK-0001 marcado como usado/)).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Este evento no tiene tickets pagados' })).toBeInTheDocument();
  });

  it('valida el ingreso de un ticket pagado', async () => {
    let estado: 'PAID' | 'USED' = 'PAID';
    servidor.use(
      http.get(`${API}/events/published`, () => HttpResponse.json([])),
      http.get(`${API}/tickets/${ticket.ticketCode}`, () => HttpResponse.json({ ...ticket, status: estado })),
      http.patch(`${API}/tickets/${ticket.ticketCode}/use`, () => {
        estado = 'USED';
        return HttpResponse.json({ ...ticket, status: 'USED' });
      }),
    );
    const usuario = userEvent.setup();
    renderizarApp('/staff/validacion', { rol: 'STAFF' });

    await usuario.type(await screen.findByLabelText('Código del ticket'), ticket.ticketCode);
    await usuario.click(screen.getByRole('button', { name: 'Buscar' }));
    await usuario.click(await screen.findByRole('button', { name: 'Validar ingreso' }));

    expect(await screen.findByText(/Ingreso validado/)).toBeInTheDocument();
  });
});
