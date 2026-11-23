import { z } from 'zod';
import { esquemaArtista } from '../types/dominio';
import { construirRuta, request } from './client';

/** GET /api/artists/active */
export const obtenerArtistasActivos = () =>
  request('/api/artists/active', { esquema: z.array(esquemaArtista) });

/** GET /api/artists/{id} */
export const obtenerArtista = (id: string) =>
  request(`/api/artists/${encodeURIComponent(id)}`, { esquema: esquemaArtista });

/** GET /api/artists/by-stage-name?stageName= */
export const obtenerArtistaPorNombre = (stageName: string) =>
  request(construirRuta('/api/artists/by-stage-name', { stageName }), { esquema: esquemaArtista });
