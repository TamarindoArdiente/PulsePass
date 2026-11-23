import type { EstadoSesion } from '../context/authContexto';
import type { EstadoEvento } from '../types/dominio';

/** Qué se muestra en el panel de compra según sesión, rol y estado del evento (PRD §9.5 / §12.4). */
export type AccionCompra =
  | { tipo: 'cargando' }
  | { tipo: 'anonimo' }
  | { tipo: 'oculto' }
  | { tipo: 'bloqueado'; motivo: string }
  | { tipo: 'permitido' };

const MOTIVOS: Record<Exclude<EstadoEvento, 'PUBLISHED'>, string> = {
  DRAFT: 'Este evento todavía no está publicado.',
  SOLD_OUT: 'Las entradas están agotadas.',
  CANCELLED: 'Este evento fue cancelado.',
  FINISHED: 'Este evento ya finalizó.',
};

export function accionDeCompra(sesion: EstadoSesion, estado: EstadoEvento): AccionCompra {
  if (sesion.estado === 'cargando') return { tipo: 'cargando' };

  // STAFF/ADMIN no compran desde la UI (la API autoriza la compra solo a USER).
  if (sesion.estado === 'autenticado' && !sesion.usuario.roles.includes('USER')) {
    return { tipo: 'oculto' };
  }
  if (estado !== 'PUBLISHED') return { tipo: 'bloqueado', motivo: MOTIVOS[estado] };
  if (sesion.estado === 'anonimo') return { tipo: 'anonimo' };
  return { tipo: 'permitido' };
}
