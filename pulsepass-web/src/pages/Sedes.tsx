import { useState } from 'react';
import { TarjetaSede } from '../components/sedes/TarjetaSede';
import { Campo } from '../components/ui/Campo';
import { Esqueleto } from '../components/ui/Cargando';
import { EstadoError } from '../components/ui/EstadoError';
import { EstadoVacio } from '../components/ui/EstadoVacio';
import { IconoBuscar } from '../components/ui/iconos';
import { useSedesActivas } from '../hooks/useSedes';
import { useTitulo } from '../hooks/useTitulo';
import { normalizar } from '../lib/filtrosEventos';

export default function Sedes() {
  useTitulo('Sedes');
  const [q, setQ] = useState('');
  const consulta = useSedesActivas();

  const texto = normalizar(q);
  const sedes = (consulta.data ?? []).filter((s) => texto === '' || normalizar(`${s.name} ${s.city}`).includes(texto));

  return (
    <div className="space-y-6">
      <h1 className="text-4xl sm:text-5xl">Sedes</h1>

      <form role="search" aria-label="Buscar sedes" onSubmit={(e) => e.preventDefault()} className="max-w-md">
        <Campo etiqueta="Buscar por nombre o ciudad" type="search" value={q} onChange={(e) => setQ(e.target.value)} />
      </form>

      {consulta.isPending && (
        <div role="status" aria-busy="true" aria-label="Cargando sedes" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Esqueleto key={i} className="h-32" />
          ))}
        </div>
      )}
      {consulta.isError && <EstadoError error={consulta.error} titulo="No pudimos cargar las sedes" onReintentar={() => void consulta.refetch()} />}

      {consulta.data &&
        (sedes.length === 0 ? (
          <EstadoVacio
            icono={<IconoBuscar />}
            titulo={q === '' ? 'Todavía no hay sedes activas' : 'Sin resultados para tu búsqueda'}
            descripcion={q === '' ? undefined : 'Prueba con otro nombre o ciudad.'}
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sedes.map((s) => (
              <li key={s.id}>
                <TarjetaSede sede={s} />
              </li>
            ))}
          </ul>
        ))}
    </div>
  );
}
