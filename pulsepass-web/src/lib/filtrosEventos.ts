import type { CategoriaEvento, ResumenEvento } from '../types/dominio';

/** Minúsculas y sin tildes: "musica" encuentra "Música". */
export function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

interface Filtros {
  q: string;
  categoria: CategoriaEvento | null;
}

/** El texto y la categoría filtran en el cliente (PRD §9.4). Devuelve la lista ordenada por fecha. */
export function filtrarEventos(eventos: readonly ResumenEvento[], { q, categoria }: Filtros): ResumenEvento[] {
  const texto = normalizar(q);
  return eventos
    .filter((e) => (categoria === null || e.category === categoria) && (texto === '' || normalizar(e.name).includes(texto)))
    .toSorted((a, b) => a.eventDate.localeCompare(b.eventDate));
}
