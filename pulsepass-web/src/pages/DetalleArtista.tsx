import { Link, useParams } from 'react-router';
import { AvatarArtista } from '../components/artistas/AvatarArtista';
import { GrillaEventos } from '../components/eventos/GrillaEventos';
import { Esqueleto, GrillaEsqueletos } from '../components/ui/Cargando';
import { EnlaceBoton } from '../components/ui/EnlaceBoton';
import { ErrorDeRecurso } from '../components/ui/Resultado';
import { EstadoError } from '../components/ui/EstadoError';
import { EstadoVacio } from '../components/ui/EstadoVacio';
import { IconoCalendario, IconoFlechaIzquierda } from '../components/ui/iconos';
import { useArtista } from '../hooks/useArtistas';
import { useEventosPorArtista } from '../hooks/useEventos';
import { useTitulo } from '../hooks/useTitulo';
import { RUTAS } from '../lib/rutas';

export default function DetalleArtista() {
  const { id } = useParams();
  const consulta = useArtista(id);
  const artista = consulta.data;
  // Los eventos se piden por nombre artístico, así que esperan a que llegue el artista.
  const eventos = useEventosPorArtista(artista?.stageName);

  useTitulo(artista?.stageName ?? 'Artista');

  if (consulta.isPending) return <Esqueleto className="h-48" />;
  if (consulta.isError || artista === undefined) {
    return (
      <ErrorDeRecurso
        error={consulta.error}
        recurso="al artista"
        volverA={RUTAS.artistas}
        textoVolver="Ver todos los artistas"
        onReintentar={() => void consulta.refetch()}
      />
    );
  }

  return (
    <div className="space-y-10">
      <Link to={RUTAS.artistas} className="inline-flex items-center gap-1.5 font-bold text-acento hover:underline">
        <IconoFlechaIzquierda /> Volver a artistas
      </Link>

      <header className="flex flex-col items-start gap-6 rounded-3xl border border-borde bg-superficie p-6 shadow-tarjeta sm:flex-row sm:items-center sm:p-8">
        <AvatarArtista nombre={artista.stageName} className="size-28 text-4xl" />
        <div>
          <h1 className="text-4xl sm:text-5xl">{artista.stageName}</h1>
          <p className="mt-2 text-lg text-tinta-suave">
            {artista.genre} · {artista.country}
          </p>
          {!artista.active && <p className="mt-2 text-sm font-bold text-amber-700 dark:text-amber-300">Este artista no está activo.</p>}
        </div>
      </header>

      <section aria-labelledby="titulo-eventos-artista">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <h2 id="titulo-eventos-artista" className="text-3xl">
            Eventos
          </h2>
          <EnlaceBoton to={RUTAS.eventosDeArtista(artista.stageName)} variante="secundario" tamano="pequeno">
            Ver en la cartelera
          </EnlaceBoton>
        </div>
        {eventos.isPending && <GrillaEsqueletos />}
        {eventos.isError && <EstadoError error={eventos.error} titulo="No pudimos cargar los eventos" onReintentar={() => void eventos.refetch()} />}
        {eventos.data &&
          (eventos.data.length === 0 ? (
            <EstadoVacio icono={<IconoCalendario />} titulo="Sin eventos por ahora" descripcion="Cuando se publique uno con este artista, aparecerá aquí." />
          ) : (
            <GrillaEventos eventos={eventos.data} />
          ))}
      </section>
    </div>
  );
}
