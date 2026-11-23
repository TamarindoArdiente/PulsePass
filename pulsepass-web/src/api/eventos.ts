import { z } from 'zod';
import { esquemaEvento, esquemaResumenEvento } from '../types/dominio';
import type { SolicitudCrearEvento } from '../types/solicitudes';
import { construirRuta, request } from './client';

const c = encodeURIComponent;

/** GET /api/events/published — la API no ofrece "listar todos" (GAP-01). */
export const obtenerEventosPublicados = () =>
  request('/api/events/published', { esquema: z.array(esquemaResumenEvento) });

/** GET /api/events/{eventCode} — público si está publicado; un borrador solo lo ven STAFF/ADMIN. */
export const obtenerEvento = (eventCode: string) =>
  request(`/api/events/${c(eventCode)}`, { esquema: esquemaEvento });

/** GET /api/events/by-artist?stageName= */
export const obtenerEventosPorArtista = (stageName: string) =>
  request(construirRuta('/api/events/by-artist', { stageName }), {
    esquema: z.array(esquemaResumenEvento),
  });

/** POST /api/events (ADMIN) → 201 */
export const crearEvento = (datos: SolicitudCrearEvento) =>
  request('/api/events', { metodo: 'POST', cuerpo: datos, esquema: esquemaEvento });

/** PATCH /api/events/{eventCode}/publish (ADMIN) */
export const publicarEvento = (eventCode: string) =>
  request(`/api/events/${c(eventCode)}/publish`, { metodo: 'PATCH', esquema: esquemaEvento });

/** POST /api/events/{eventCode}/artists/{artistId} (ADMIN) */
export const asociarArtista = (eventCode: string, artistId: number) =>
  request(`/api/events/${c(eventCode)}/artists/${c(String(artistId))}`, {
    metodo: 'POST',
    esquema: esquemaEvento,
  });
