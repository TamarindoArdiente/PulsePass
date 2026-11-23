import { useState } from 'react';
import { Link } from 'react-router';
import { AvatarArtista } from '../components/artistas/AvatarArtista';
import { Campo } from '../components/ui/Campo';
import { Esqueleto } from '../components/ui/Cargando';
import { EstadoError } from '../components/ui/EstadoError';
import { EstadoVacio } from '../components/ui/EstadoVacio';
import { IconoBuscar } from '../components/ui/iconos';
import { useArtistasActivos } from '../hooks/useArtistas';
import { useTitulo } from '../hooks/useTitulo';
import { normalizar } from '../lib/filtrosEventos';
import { RUTAS } from '../lib/rutas';

export default function Artistas() {
  useTitulo('Artistas');
  const [q, setQ] = useState('');
  const consulta = useArtistasActivos();

  const texto = normalizar(q);
  const artistas = (consulta.data ?? []).filter(
    (a) => texto === '' || normalizar(`${a.stageName} ${a.genre} ${a.country}`).includes(texto),
  );

  return (
    <div className="space-y-6">
      <h1 className="text-4xl sm:text-5xl">Artistas</h1>

      <form role="search" aria-label="Buscar artistas" onSubmit={(e) => e.preventDefault()} className="max-w-md">
        <Campo etiqueta="Buscar por nombre, género o país" type="search" value={q} onChange={(e) => setQ(e.target.value)} />
      </form>

      {consulta.isPending && (
        <div role="status" aria-busy="true" aria-label="Cargando artistas" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Esqueleto key={i} className="h-28" />
          ))}
        </div>
      )}
      {consulta.isError && <EstadoError error={consulta.error} titulo="No pudimos cargar los artistas" onReintentar={() => void consulta.refetch()} />}

      {consulta.data &&
        (artistas.length === 0 ? (
          <EstadoVacio
            icono={<IconoBuscar />}
            titulo={q === '' ? 'Todavía no hay artistas activos' : 'Sin resultados para tu búsqueda'}
            descripcion={q === '' ? undefined : 'Prueba con otro nombre, género o país.'}
          />
        ) : (
          <>
            <p role="status" className="text-sm font-medium text-tinta-suave">
              {artistas.length === 1 ? '1 artista' : `${artistas.length} artistas`}
            </p>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {artistas.map((a) => (
                <li key={a.id}>
                  <Link
                    to={RUTAS.artista(a.id)}
                    className="group flex h-full items-center gap-4 rounded-3xl border border-borde bg-superficie p-5 shadow-tarjeta transition-transform duration-200 hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                  >
                    <AvatarArtista nombre={a.stageName} className="size-16 text-xl" />
                    <span className="min-w-0">
                      <span className="block truncate font-titulo text-xl font-extrabold group-hover:underline">{a.stageName}</span>
                      <span className="block text-sm text-tinta-suave">{a.genre}</span>
                      <span className="block text-sm text-tinta-suave">{a.country}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ))}
    </div>
  );
}
