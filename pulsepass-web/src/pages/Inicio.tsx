import { Link } from 'react-router';
import { AvatarArtista } from '../components/artistas/AvatarArtista';
import { EscenaHero } from '../components/inicio/EscenaHero';
import { GrillaEventos } from '../components/eventos/GrillaEventos';
import { EnlaceBoton } from '../components/ui/EnlaceBoton';
import { Esqueleto, GrillaEsqueletos } from '../components/ui/Cargando';
import { EstadoError } from '../components/ui/EstadoError';
import { EstadoVacio } from '../components/ui/EstadoVacio';
import { IconoCalendario, IconoFlechaDerecha } from '../components/ui/iconos';
import { useArtistasActivos } from '../hooks/useArtistas';
import { useAuth } from '../hooks/useAuth';
import { useEventosPublicados } from '../hooks/useEventos';
import { useTitulo } from '../hooks/useTitulo';
import { filtrarEventos } from '../lib/filtrosEventos';
import { RUTAS } from '../lib/rutas';

export default function Inicio() {
  useTitulo('Inicio');
  const { sesion } = useAuth();
  const eventos = useEventosPublicados();
  const artistas = useArtistasActivos();

  const proximos = eventos.data ? filtrarEventos(eventos.data, { q: '', categoria: null }).slice(0, 3) : [];

  return (
    <div className="space-y-14">
      <section
        className="relative grid items-center gap-8 overflow-hidden rounded-[2rem] px-6 py-12 text-[#2b1208] sm:px-12 sm:py-16 md:grid-cols-[1.4fr_1fr] dark:text-white"
        style={{ background: 'var(--degradado-hero)' }}
      >
        <div>
          <h1 className="text-balance text-4xl sm:text-6xl">Descubre los mejores eventos</h1>
          <p className="mt-4 max-w-md text-lg">Música, cultura, deporte y tecnología en un solo lugar. Compra tus entradas en minutos.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <EnlaceBoton to={RUTAS.eventos} variante="claro">
              Ver cartelera
            </EnlaceBoton>
            {sesion.estado === 'anonimo' && (
              <EnlaceBoton to={RUTAS.registro} variante="contornoClaro">
                Crear cuenta
              </EnlaceBoton>
            )}
          </div>
        </div>
        <EscenaHero className="mx-auto w-56 max-w-full sm:w-72" />
      </section>

      <section aria-labelledby="titulo-proximos">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 id="titulo-proximos" className="text-3xl">
            Próximos eventos
          </h2>
          <Link to={RUTAS.eventos} className="flex items-center gap-1 font-bold text-acento hover:underline">
            Ver todos <IconoFlechaDerecha />
          </Link>
        </div>
        {eventos.isPending && <GrillaEsqueletos />}
        {eventos.isError && <EstadoError error={eventos.error} onReintentar={() => void eventos.refetch()} />}
        {eventos.data && proximos.length === 0 && (
          <EstadoVacio icono={<IconoCalendario />} titulo="Aún no hay eventos publicados" descripcion="Vuelve pronto: estamos preparando la cartelera." />
        )}
        {proximos.length > 0 && <GrillaEventos eventos={proximos} />}
      </section>

      <section aria-labelledby="titulo-artistas">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 id="titulo-artistas" className="text-3xl">
            Artistas destacados
          </h2>
          <Link to={RUTAS.artistas} className="flex items-center gap-1 font-bold text-acento hover:underline">
            Ver todos <IconoFlechaDerecha />
          </Link>
        </div>
        {artistas.isPending && (
          <div aria-busy="true" role="status" aria-label="Cargando artistas" className="flex flex-wrap gap-6">
            {Array.from({ length: 4 }, (_, i) => (
              <Esqueleto key={i} className="h-20 w-40" />
            ))}
          </div>
        )}
        {artistas.isError && <EstadoError error={artistas.error} titulo="No pudimos cargar los artistas" onReintentar={() => void artistas.refetch()} />}
        {artistas.data && artistas.data.length === 0 && <EstadoVacio titulo="Todavía no hay artistas activos" />}
        {artistas.data && artistas.data.length > 0 && (
          <ul className="flex flex-wrap gap-x-8 gap-y-5">
            {artistas.data.slice(0, 6).map((a) => (
              <li key={a.id}>
                <Link to={RUTAS.artista(a.id)} className="group flex items-center gap-3">
                  <AvatarArtista nombre={a.stageName} />
                  <span>
                    <span className="block font-bold group-hover:underline">{a.stageName}</span>
                    <span className="block text-sm text-tinta-suave">{a.genre}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
