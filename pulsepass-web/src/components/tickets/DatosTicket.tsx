import { formatearFechaHora, formatearPrecioCOP } from '../../lib/formato';
import { etiquetaTipo } from '../../lib/tiposTicket';
import type { Ticket } from '../../types/dominio';

/** Lista de datos del ticket, reutilizada en confirmación y detalle. */
export function DatosTicket({ ticket }: { ticket: Ticket }) {
  const datos: readonly { etiqueta: string; valor: string }[] = [
    { etiqueta: 'Evento', valor: ticket.eventName },
    { etiqueta: 'Tipo de entrada', valor: etiquetaTipo(ticket.type) },
    { etiqueta: 'Precio', valor: formatearPrecioCOP(ticket.price) },
    { etiqueta: 'Fecha de compra', valor: formatearFechaHora(ticket.purchaseDate) },
    { etiqueta: 'Correo', valor: ticket.userEmail },
  ];
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {datos.map((d) => (
        <div key={d.etiqueta} className="min-w-0">
          <dt className="text-sm font-bold text-tinta-suave">{d.etiqueta}</dt>
          <dd className="break-words text-lg">{d.valor}</dd>
        </div>
      ))}
    </dl>
  );
}
