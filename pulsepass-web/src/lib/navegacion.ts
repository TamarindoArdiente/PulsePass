import { z } from 'zod';
import { RUTAS } from './rutas';

/** `location.state` llega como `unknown`: se valida antes de usarlo (FE-002). */
const esquemaEstadoNavegacion = z.object({
  desde: z.string().optional(),
  registrado: z.boolean().optional(),

  creado: z.boolean().optional(),
});
export type EstadoNavegacion = z.infer<typeof esquemaEstadoNavegacion>;

export function leerEstadoNavegacion(estado: unknown): EstadoNavegacion {
  const r = esquemaEstadoNavegacion.safeParse(estado);
  return r.success ? r.data : {};
}

/** Solo rutas internas: evita redirecciones a otros sitios ("//otro.com", "https://…"). */
export function destinoSeguro(desde: string | undefined): string {
  return desde !== undefined && desde.startsWith('/') && !desde.startsWith('//') ? desde : RUTAS.inicio;
}
