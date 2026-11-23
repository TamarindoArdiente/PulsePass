import { Link } from 'react-router';
import { formatearFecha, formatearPrecioCOP } from '../../lib/formato';
import { RUTAS } from '../../lib/rutas';
import { etiquetaTipo } from '../../lib/tiposTicket';
import type { Ticket } from '../../types/dominio';
import { Badge } from '../ui/Badge';
import { IconoTicket } from '../ui/iconos';

export function TarjetaTicket({ ticket }: { ticket: Ticket }) {
  return (
    <Link
      to={RUTAS.ticket(ticket.ticketCode)}
      className="group flex overflow-hidden rounded-3xl border border-borde bg-superficie shadow-tarjeta transition-transform duration-200 hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <span aria-hidden="true" className="grid w-16 shrink-0 place-items-center text-3xl text-white" style={{ background: 'var(--degradado-hero)' }}>
        <IconoTicket />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-2 border-l-2 border-dashed border-borde p-4">
        <span className="flex flex-wrap items-start justify-between gap-2">
          <span className="font-titulo text-lg font-extrabold leading-tight group-hover:underline">{ticket.eventName}</span>
          <Badge tono={ticket.status} />
        </span>
        <span className="text-sm text-tinta-suave">
          {etiquetaTipo(ticket.type)} · {formatearPrecioCOP(ticket.price)}
        </span>
        <span className="text-sm text-tinta-suave">
          Comprado el {formatearFecha(ticket.purchaseDate)} · <span className="font-mono">{ticket.ticketCode}</span>
        </span>
      </span>
    </Link>
  );
}
