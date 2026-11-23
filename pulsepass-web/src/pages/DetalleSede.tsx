import { Link, useParams } from 'react-router';
import { Esqueleto } from '../components/ui/Cargando';
import { ErrorDeRecurso } from '../components/ui/Resultado';
import { IconoFlechaIzquierda, IconoUbicacion } from '../components/ui/iconos';
import { useSede } from '../hooks/useSedes';
import { useTitulo } from '../hooks/useTitulo';
import { RUTAS } from '../lib/rutas';

export default function DetalleSede() {
  const { code } = useParams();
  const consulta = useSede(code);
  const sede = consulta.data;

  useTitulo(sede?.name ?? 'Sede');

  if (consulta.isPending) return <Esqueleto className="h-48" />;
  if (consulta.isError || sede === undefined) {
    return (
      <ErrorDeRecurso
        error={consulta.error}
        recurso="la sede"
        volverA={RUTAS.sedes}
        textoVolver="Ver todas las sedes"
        onReintentar={() => void consulta.refetch()}
      />
    );
  }

  const datos: readonly { etiqueta: string; valor: string }[] = [
    { etiqueta: 'Ciudad', valor: sede.city },
    { etiqueta: 'Dirección', valor: sede.address },
    { etiqueta: 'Capacidad', valor: `${sede.capacity.toLocaleString('es-CO')} personas` },
    { etiqueta: 'Código', valor: sede.code },
  ];

  return (
    <div className="space-y-8">
      <Link to={RUTAS.sedes} className="inline-flex items-center gap-1.5 font-bold text-acento hover:underline">
        <IconoFlechaIzquierda /> Volver a sedes
      </Link>

      <article className="overflow-hidden rounded-3xl border border-borde bg-superficie shadow-tarjeta">
        <div className="flex h-32 items-center justify-center text-7xl text-white" style={{ background: 'var(--degradado-hero)' }} aria-hidden="true">
          <IconoUbicacion />
        </div>
        <div className="p-6 sm:p-8">
          <h1 className="text-3xl sm:text-5xl">{sede.name}</h1>
          {!sede.active && <p className="mt-2 text-sm font-bold text-amber-700 dark:text-amber-300">Esta sede no está activa.</p>}
          <dl className="mt-6 grid gap-5 sm:grid-cols-2">
            {datos.map((d) => (
              <div key={d.etiqueta}>
                <dt className="text-sm font-bold text-tinta-suave">{d.etiqueta}</dt>
                <dd className="text-lg">{d.valor}</dd>
              </div>
            ))}
          </dl>
        </div>
      </article>
    </div>
  );
}
