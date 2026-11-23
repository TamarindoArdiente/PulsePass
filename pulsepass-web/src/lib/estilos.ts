import type { TonoBadge } from '../types/dominio';

/**
 * Clases completas (nunca dinámicas: FE-008) para cada estado.
 * Claro: fondo pastel + texto oscuro. Oscuro: fondo translúcido + texto claro.
 */
export const CLASES_BADGE: Record<TonoBadge, string> = {
  DRAFT: 'bg-slate-200 text-slate-700 dark:bg-slate-400/20 dark:text-slate-200',
  PUBLISHED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300',
  SOLD_OUT: 'bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-400/15 dark:text-red-300',
  FINISHED: 'bg-slate-300 text-slate-800 dark:bg-slate-400/20 dark:text-slate-200',
  RESERVED: 'bg-sky-100 text-sky-800 dark:bg-sky-400/15 dark:text-sky-300',
  PAID: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300',
  USED: 'bg-slate-300 text-slate-800 dark:bg-slate-400/20 dark:text-slate-200',
};


export const ETIQUETA_BADGE: Record<TonoBadge, string> = {
  DRAFT: 'Borrador',
  PUBLISHED: 'Publicado',
  SOLD_OUT: 'Agotado',
  CANCELLED: 'Cancelado',
  FINISHED: 'Finalizado',
  RESERVED: 'Reservado',
  PAID: 'Pagado',
  USED: 'Usado',
};

/** Variantes de botón, compartidas por <Boton> y <EnlaceBoton> (una sola fuente de verdad). */
export type VarianteBoton = 'primario' | 'secundario' | 'peligro' | 'fantasma' | 'claro' | 'contornoClaro';

export const CLASES_VARIANTE_BOTON: Record<VarianteBoton, string> = {
  primario:
    'bg-primario text-tinta-primario hover:bg-primario-hover shadow-[0_6px_0_0_rgb(0_0_0/0.18)] active:translate-y-0.5 active:shadow-[0_3px_0_0_rgb(0_0_0/0.18)]',
  secundario: 'border-2 border-tinta/70 bg-transparent text-tinta hover:bg-superficie-2',
  peligro: 'bg-red-600 text-white hover:bg-red-700',
  fantasma: 'bg-transparent text-acento hover:bg-superficie-2',
  /** Para fondos de color (hero): blanco sólido y contorno blanco. */
  claro: 'bg-white text-[#2b1208] hover:bg-white/90',
  contornoClaro: 'border-2 border-current bg-transparent hover:bg-white/15',
};
