import { Link } from 'react-router';
import { CATEGORIAS } from '../../lib/categorias';
import { formatearFecha } from '../../lib/formato';
import { RUTAS } from '../../lib/rutas';
import type { ResumenEvento } from '../../types/dominio';
import { Badge } from '../ui/Badge';
import { IconoCalendario, IconoUbicacion } from '../ui/iconos';
import { IconoCategoria } from './IconoCategoria';

/** La tarjeta completa es un enlace al detalle (PRD §9.4). Sin fotos: panel de color + ícono por categoría. */
export function TarjetaEvento({ evento }: { evento: ResumenEvento }) {
  const categoria = CATEGORIAS[evento.category];
  return (
    <Link
      to={RUTAS.evento(evento.eventCode)}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-borde bg-superficie shadow-tarjeta transition-transform duration-200 hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div className={`flex h-32 items-end justify-between p-4 text-white ${categoria.panel}`}>
        <span className="rounded-full bg-black/25 px-3 py-1 text-xs font-bold backdrop-blur-sm">{categoria.etiqueta}</span>
        <IconoCategoria categoria={evento.category} className="text-5xl opacity-90" />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-xl leading-tight">{evento.name}</h3>
        <ul className="space-y-1 text-sm text-tinta-suave">
          <li className="flex items-center gap-2">
            <IconoCalendario /> {formatearFecha(evento.eventDate)}
          </li>
          <li className="flex items-center gap-2">
            <IconoUbicacion /> {evento.venueName}
          </li>
        </ul>
        <div className="mt-auto pt-1">
          <Badge tono={evento.status} />
        </div>
      </div>
    </Link>
  );
}
