import { z } from 'zod';
import { esquemaSede } from '../types/dominio';
import { request } from './client';

/** GET /api/venues/active */
export const obtenerSedesActivas = () =>
  request('/api/venues/active', { esquema: z.array(esquemaSede) });

/** GET /api/venues/{code} */
export const obtenerSede = (code: string) =>
  request(`/api/venues/${encodeURIComponent(code)}`, { esquema: esquemaSede });
