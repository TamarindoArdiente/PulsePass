import { useParams } from 'react-router';
import { DatosTicket } from '../components/tickets/DatosTicket';
import { Badge } from '../components/ui/Badge';
import { Esqueleto } from '../components/ui/Cargando';
import { EnlaceBoton } from '../components/ui/EnlaceBoton';
import { ErrorDeRecurso } from '../components/ui/Resultado';
import { IconoCheck } from '../components/ui/iconos';
import { useTicket } from '../hooks/useTickets';
import { useTitulo } from '../hooks/useTitulo';
import { RUTAS } from '../lib/rutas';

export default function ConfirmacionCompra() {
  useTitulo('Compra confirmada');
  const { ticketCode } = useParams();
  // Normalmente ya está en caché (lo guarda la compra); si se recarga la página, se pide de nuevo.
  const consulta = useTicket(ticketCode);
  const ticket = consulta.data;

  if (consulta.isPending) return <Esqueleto className="mx-auto h-72 max-w-2xl" />;
  if (consulta.isError || ticket === undefined) {
    return (
      <ErrorDeRecurso
        error={consulta.error}
        recurso="tu ticket"
        volverA={RUTAS.misTickets}
        textoVolver="Ir a mis tickets"
        onReintentar={() => void consulta.refetch()}
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <span aria-hidden="true" className="grid size-16 place-items-center rounded-full bg-emerald-500 text-4xl text-white">
          <IconoCheck />
        </span>
        <h1 className="text-3xl sm:text-5xl">¡Compra realizada!</h1>
        <p className="text-tinta-suave">Guarda tu código: lo necesitas para entrar al evento.</p>
      </div>

      <article className="rounded-3xl border border-borde bg-superficie p-6 shadow-tarjeta sm:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-borde bg-superficie-2 p-4">
          <div>
            <p className="text-sm font-bold text-tinta-suave">Código del ticket</p>
            <p className="break-all font-mono text-xl font-bold sm:text-2xl">{ticket.ticketCode}</p>
          </div>
          <Badge tono={ticket.status} />
        </div>
        <DatosTicket ticket={ticket} />
      </article>

      <div className="flex flex-wrap justify-center gap-3">
        <EnlaceBoton to={RUTAS.ticket(ticket.ticketCode)}>Ver mi ticket</EnlaceBoton>
        <EnlaceBoton to={RUTAS.misTickets} variante="secundario">
          Mis tickets
        </EnlaceBoton>
        <EnlaceBoton to={RUTAS.eventos} variante="fantasma">
          Seguir explorando
        </EnlaceBoton>
      </div>
    </div>
  );
}
