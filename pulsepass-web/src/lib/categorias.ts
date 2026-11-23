import type { CategoriaEvento } from '../types/dominio';

/** Etiqueta en español y color del panel de cada categoría (la API no entrega imágenes, DES-02). */
export const CATEGORIAS: Record<CategoriaEvento, { etiqueta: string; panel: string }> = {
  MUSIC: { etiqueta: 'Música', panel: 'bg-linear-to-br from-fuchsia-500 to-orange-400' },
  SPORTS: { etiqueta: 'Deportes', panel: 'bg-linear-to-br from-emerald-500 to-lime-400' },
  TECHNOLOGY: { etiqueta: 'Tecnología', panel: 'bg-linear-to-br from-sky-500 to-indigo-500' },
  EDUCATION: { etiqueta: 'Educación', panel: 'bg-linear-to-br from-amber-400 to-yellow-300' },
  CULTURE: { etiqueta: 'Cultura', panel: 'bg-linear-to-br from-rose-500 to-orange-400' },
  ENTERTAINMENT: { etiqueta: 'Entretenimiento', panel: 'bg-linear-to-br from-violet-500 to-pink-400' },
};

export const LISTA_CATEGORIAS = Object.keys(CATEGORIAS) as CategoriaEvento[];
