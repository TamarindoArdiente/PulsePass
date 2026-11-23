import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { API, artista, evento, sede } from '../test/datos';
import { servidor } from '../test/servidor';
import { errorApi, renderizarApp } from '../test/utilidades';

const borrador = { ...evento, status: 'DRAFT' as const, artists: [] };

describe('Administración de eventos', () => {
  it('crea un evento y llega a su pantalla de gestión como borrador', async () => {
    let cuerpo: Record<string, unknown> | null = null;
    servidor.use(
      http.get(`${API}/venues/active`, () => HttpResponse.json([sede])),
      http.post(`${API}/events`, async ({ request }) => {
        cuerpo = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(borrador, { status: 201 });
      }),
      http.get(`${API}/artists/active`, () => HttpResponse.json([artista])),
    );
    const usuario = userEvent.setup();
    renderizarApp('/admin/eventos/nuevo', { rol: 'ADMIN' });

    await usuario.type(await screen.findByLabelText('Código'), 'FEST-1');
    await usuario.type(screen.getByLabelText('Nombre'), 'Festival Solar');
    fireEvent.change(screen.getByLabelText('Fecha y hora'), { target: { value: '2026-12-12T20:00' } });
    await screen.findByRole('option', { name: /Arena Central/ }); // las sedes ya cargaron
    await usuario.selectOptions(screen.getByLabelText('Sede'), 'SEDE-1');
    await usuario.click(screen.getByRole('button', { name: 'Crear evento' }));

    expect(await screen.findByText('Evento creado como borrador.')).toBeInTheDocument();
    expect(cuerpo).toMatchObject({ eventCode: 'FEST-1', venueCode: 'SEDE-1', eventDate: '2026-12-12T20:00:00', minimumAge: 0 });
  });

  it('muestra los errores por campo que devuelve el backend (400)', async () => {
    servidor.use(
      http.get(`${API}/venues/active`, () => HttpResponse.json([sede])),
      http.post(`${API}/events`, () => errorApi(400, 'Validación', { eventCode: 'El código ya tiene un formato inválido' })),
    );
    const usuario = userEvent.setup();
    renderizarApp('/admin/eventos/nuevo', { rol: 'ADMIN' });

    await usuario.type(await screen.findByLabelText('Código'), 'FEST 1');
    await usuario.type(screen.getByLabelText('Nombre'), 'Festival Solar');
    fireEvent.change(screen.getByLabelText('Fecha y hora'), { target: { value: '2026-12-12T20:00' } });
    await screen.findByRole('option', { name: /Arena Central/ }); // las sedes ya cargaron
    await usuario.selectOptions(screen.getByLabelText('Sede'), 'SEDE-1');
    await usuario.click(screen.getByRole('button', { name: 'Crear evento' }));

    expect(await screen.findByText('El código ya tiene un formato inválido')).toBeInTheDocument();
  });

  it('publica un borrador tras confirmar', async () => {
    let publicado = false;
    servidor.use(
      http.get(`${API}/events/${evento.eventCode}`, () => HttpResponse.json(publicado ? { ...borrador, status: 'PUBLISHED' } : borrador)),
      http.get(`${API}/artists/active`, () => HttpResponse.json([artista])),
      http.patch(`${API}/events/${evento.eventCode}/publish`, () => {
        publicado = true;
        return HttpResponse.json({ ...borrador, status: 'PUBLISHED' });
      }),
    );
    const usuario = userEvent.setup();
    renderizarApp(`/admin/eventos/${evento.eventCode}`, { rol: 'ADMIN' });

    await usuario.click(await screen.findByRole('button', { name: 'Publicar evento' }));
    const dialogo = await screen.findByRole('dialog');
    await usuario.click(within(dialogo).getByRole('button', { name: 'Publicar' }));

    expect(await screen.findByText(/Evento publicado/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Publicar evento' })).not.toBeInTheDocument();
  });

  it('asocia un artista al evento', async () => {
    let asociado = false;
    servidor.use(
      http.get(`${API}/events/${evento.eventCode}`, () => HttpResponse.json(asociado ? { ...borrador, artists: [artista] } : borrador)),
      http.get(`${API}/artists/active`, () => HttpResponse.json([artista])),
      http.post(`${API}/events/${evento.eventCode}/artists/${artista.id}`, () => {
        asociado = true;
        return HttpResponse.json({ ...borrador, artists: [artista] });
      }),
    );
    const usuario = userEvent.setup();
    renderizarApp(`/admin/eventos/${evento.eventCode}`, { rol: 'ADMIN' });

    await usuario.selectOptions(await screen.findByLabelText('Asociar un artista'), String(artista.id));
    await usuario.click(screen.getByRole('button', { name: 'Asociar' }));

    expect(await screen.findByText('Artista asociado.')).toBeInTheDocument();
    expect(screen.getByText('Solar Beat')).toBeInTheDocument();
  });

  it('abre un borrador por su código y lo recuerda en la lista', async () => {
    servidor.use(
      http.get(`${API}/events/published`, () => HttpResponse.json([])),
      http.get(`${API}/events/${evento.eventCode}`, () => HttpResponse.json(borrador)),
      http.get(`${API}/artists/active`, () => HttpResponse.json([])),
    );
    const usuario = userEvent.setup();
    renderizarApp('/admin/eventos', { rol: 'ADMIN' });

    await usuario.type(await screen.findByLabelText('Código del evento'), evento.eventCode);
    await usuario.click(screen.getByRole('button', { name: 'Abrir' }));

    expect(await screen.findByRole('heading', { name: 'Festival Solar', level: 1 })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('pulsepass:admin-eventos') ?? '[]')).toEqual(['FEST-1']);
  });
});
