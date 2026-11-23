import { Link } from 'react-router';
import { RUTAS } from '../../lib/rutas';
import type { Sede } from '../../types/dominio';
import { IconoUbicacion } from '../ui/iconos';

export function TarjetaSede({ sede }: { sede: Sede }) {
  return (
    <Link
      to={RUTAS.sede(sede.code)}
      className="group flex h-full gap-4 rounded-3xl border border-borde bg-superficie p-5 shadow-tarjeta transition-transform duration-200 hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primario text-2xl text-tinta-primario">
        <IconoUbicacion />
      </span>
      <span className="min-w-0">
        <span className="block font-titulo text-xl font-extrabold leading-tight group-hover:underline">{sede.name}</span>
        <span className="mt-1 block text-sm text-tinta-suave">{sede.city}</span>
        <span className="block truncate text-sm text-tinta-suave">{sede.address}</span>
        <span className="mt-2 block text-sm font-bold">Capacidad {sede.capacity.toLocaleString('es-CO')}</span>
      </span>
    </Link>
  );
}
