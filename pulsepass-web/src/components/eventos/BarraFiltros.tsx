import { CATEGORIAS, LISTA_CATEGORIAS } from '../../lib/categorias';
import type { Artista, CategoriaEvento } from '../../types/dominio';
import { Boton } from '../ui/Boton';
import { Campo } from '../ui/Campo';
import { IconoBuscar } from '../ui/iconos';
import { Selector } from '../ui/Selector';

interface PropsBarraFiltros {
  q: string;
  categoria: CategoriaEvento | null;
  artista: string | null;
  artistas: readonly Artista[];
  onCambiar: (cambios: { q?: string; categoria?: CategoriaEvento | null; artista?: string | null }) => void;
  onLimpiar: () => void;
  hayFiltros: boolean;
}

/** Los filtros viven en la URL (?q=, ?categoria=, ?artista=) para poder compartir y recargar la búsqueda. */
export function BarraFiltros({ q, categoria, artista, artistas, onCambiar, onLimpiar, hayFiltros }: PropsBarraFiltros) {
  return (
    <form
      role="search"
      aria-label="Filtrar eventos"
      onSubmit={(e) => e.preventDefault()}
      className="grid gap-4 rounded-3xl border border-borde bg-superficie p-4 shadow-tarjeta sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto] lg:items-end"
    >
      <Campo
        etiqueta="Buscar por nombre"
        type="search"
        placeholder="Ej. festival"
        value={q}
        onChange={(e) => onCambiar({ q: e.target.value })}
        adorno={<IconoBuscar className="mr-3 text-tinta-suave" />}
      />
      <Selector
        etiqueta="Categoría"
        value={categoria ?? ''}
        onChange={(e) => onCambiar({ categoria: e.target.value === '' ? null : (e.target.value as CategoriaEvento) })}
      >
        <option value="">Todas</option>
        {LISTA_CATEGORIAS.map((c) => (
          <option key={c} value={c}>
            {CATEGORIAS[c].etiqueta}
          </option>
        ))}
      </Selector>
      <Selector etiqueta="Artista" value={artista ?? ''} onChange={(e) => onCambiar({ artista: e.target.value === '' ? null : e.target.value })}>
        <option value="">Todos</option>
        {artistas.map((a) => (
          <option key={a.id} value={a.stageName}>
            {a.stageName}
          </option>
        ))}
      </Selector>
      <Boton variante="fantasma" onClick={onLimpiar} disabled={!hayFiltros}>
        Limpiar
      </Boton>
    </form>
  );
}
