import { useSearchParams } from 'react-router';
import { BarraFiltros } from '../components/eventos/BarraFiltros';
import { GrillaEventos } from '../components/eventos/GrillaEventos';
import { GrillaEsqueletos } from '../components/ui/Cargando';
import { EstadoError } from '../components/ui/EstadoError';
import { EstadoVacio } from '../components/ui/EstadoVacio';
import { IconoBuscar } from '../components/ui/iconos';
import { useArtistasActivos } from '../hooks/useArtistas';
import { useEventosPorArtista, useEventosPublicados } from '../hooks/useEventos';
import { useTitulo } from '../hooks/useTitulo';
import { filtrarEventos } from '../lib/filtrosEventos';
import { esquemaCategoriaEvento, type CategoriaEvento } from '../types/dominio';

export default function CatalogoEventos() {
  useTitulo('Cartelera');
  const [params, setParams] = useSearchParams();

  // Los filtros viven en la URL; todo lo que llega de ella se valida.
  const q = params.get('q') ?? '';
  const categoriaValidada = esquemaCategoriaEvento.safeParse(params.get('categoria'));
  const categoria: CategoriaEvento | null = categoriaValidada.success ? categoriaValidada.data : null;
  const artista = params.get('artista') ?? null;

  const publicados = useEventosPublicados();
  const delArtista = useEventosPorArtista(artista);
  const artistas = useArtistasActivos();

  // Con ?artista= se consulta por artista; si no, la cartelera completa.
  const consulta = artista ? delArtista : publicados;
  const eventos = consulta.data ? filtrarEventos(consulta.data, { q, categoria }) : [];
  const hayFiltros = q !== '' || categoria !== null || artista !== null;

  const cambiar = (cambios: { q?: string; categoria?: CategoriaEvento | null; artista?: string | null }) => {
    setParams(
      (previos) => {
        const nuevos = new URLSearchParams(previos);
        const aplicar = (clave: string, valor: string | null | undefined) => {
          if (valor === undefined) return;
          if (valor === null || valor === '') nuevos.delete(clave);
          else nuevos.set(clave, valor);
        };
        aplicar('q', cambios.q);
        aplicar('categoria', cambios.categoria);
        aplicar('artista', cambios.artista);
        return nuevos;
      },
      { replace: true },
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-4xl sm:text-5xl">Cartelera</h1>

      <BarraFiltros
        q={q}
        categoria={categoria}
        artista={artista}
        artistas={artistas.data ?? []}
        onCambiar={cambiar}
        onLimpiar={() => setParams({}, { replace: true })}
        hayFiltros={hayFiltros}
      />

      {consulta.isPending && <GrillaEsqueletos />}
      {consulta.isError && <EstadoError error={consulta.error} titulo="No pudimos cargar la cartelera" onReintentar={() => void consulta.refetch()} />}

      {consulta.data && (
        <>
          <p role="status" className="text-sm font-medium text-tinta-suave">
            {eventos.length === 1 ? '1 evento' : `${eventos.length} eventos`}
          </p>
          {eventos.length === 0 ? (
            <EstadoVacio
              icono={<IconoBuscar />}
              titulo={hayFiltros ? 'Sin resultados para tu búsqueda' : 'Aún no hay eventos publicados'}
              descripcion={hayFiltros ? 'Prueba con otras palabras o quita algún filtro.' : 'Vuelve pronto: estamos preparando la cartelera.'}
            />
          ) : (
            <GrillaEventos eventos={eventos} />
          )}
        </>
      )}
    </div>
  );
}
