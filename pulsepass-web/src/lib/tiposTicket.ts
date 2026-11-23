import type { TipoTicket } from '../types/dominio';

/** El precio lo fija el backend al confirmar: aquí solo se describe el tipo de entrada. */
export const TIPOS_TICKET: readonly { valor: TipoTicket; etiqueta: string; descripcion: string }[] = [
  { valor: 'GENERAL', etiqueta: 'General', descripcion: 'Acceso general al evento' },
  { valor: 'VIP', etiqueta: 'VIP', descripcion: 'Zona preferencial' },
  { valor: 'BACKSTAGE', etiqueta: 'Backstage', descripcion: 'Acceso detrás del escenario' },
  { valor: 'STUDENT', etiqueta: 'Estudiante', descripcion: 'Tarifa para estudiantes' },
];

export function etiquetaTipo(tipo: TipoTicket): string {
  return TIPOS_TICKET.find((t) => t.valor === tipo)?.etiqueta ?? tipo;
}
