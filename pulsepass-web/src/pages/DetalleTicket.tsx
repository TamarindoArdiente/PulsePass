import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { DatosTicket } from '../components/tickets/DatosTicket';
import { Aviso } from '../components/ui/Aviso';
import { Badge } from '../components/ui/Badge';
import { Boton } from '../components/ui/Boton';
import { Esqueleto } from '../components/ui/Cargando';
import { EnlaceBoton } from '../components/ui/EnlaceBoton';
import { ErrorDeRecurso } from '../components/ui/Resultado';
import { IconoFlechaIzquierda } from '../components/ui/iconos';
import { Modal } from '../components/ui/Modal';
import { mensajeDeError } from '../lib/errores';
import { useCancelarTicket, useTicket } from '../hooks/useTickets';
import { useTitulo } from '../hooks/useTitulo';
import { RUTAS } from '../lib/rutas';
import { sePuedeCancelar } from '../lib/tickets';

export default function DetalleTicket() {
  useTitulo('Mi ticket');
  const { ticketCode } = useParams();
  const consulta = useTicket(ticketCode);
  const cancelar = useCancelarTicket();
  const [confirmando, setConfirmando] = useState(false);
  const [cancelado, setCancelado] = useState(false);
  const ticket = consulta.data;

  if (consulta.isPending) return <Esqueleto className="mx-auto h-72 max-w-2xl" />;
  if (consulta.isError || ticket === undefined) {
    return (
      <ErrorDeRecurso
        error={consulta.error}
        recurso="el ticket"
        volverA={RUTAS.misTickets}
        textoVolver="Ir a mis tickets"
        onReintentar={() => void consulta.refetch()}
      />
    );
  }

  const cerrarModal = () => {
    setConfirmando(false);
    cancelar.reset();
  };

  const confirmarCancelacion = () => {
    cancelar.mutate(ticket.ticketCode, {
      onSuccess: () => {
        setConfirmando(false);
        setCancelado(true);
      },
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link to={RUTAS.misTickets} className="inline-flex items-center gap-1.5 font-bold text-acento hover:underline">
        <IconoFlechaIzquierda /> Volver a mis tickets
      </Link>

      {cancelado && (
        <Aviso tono="exito" onCerrar={() => setCancelado(false)} duracionMs={4000}>
          Ticket cancelado.
        </Aviso>
      )}

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

      <div className="flex flex-wrap gap-3">
        <EnlaceBoton to={RUTAS.evento(ticket.eventCode)} variante="secundario">
          Ver el evento
        </EnlaceBoton>
        {sePuedeCancelar(ticket) && (
          <Boton variante="peligro" onClick={() => setConfirmando(true)}>
            Cancelar ticket
          </Boton>
        )}
      </div>

      <Modal
        abierto={confirmando}
        onCerrar={cerrarModal}
        titulo="¿Cancelar este ticket?"
        pie={
          <>
            <Boton variante="secundario" onClick={cerrarModal} disabled={cancelar.isPending}>
              Conservar ticket
            </Boton>
            <Boton variante="peligro" onClick={confirmarCancelacion} cargando={cancelar.isPending}>
              Sí, cancelar
            </Boton>
          </>
        }
      >
        <p>
          Vas a cancelar tu entrada para <strong>{ticket.eventName}</strong>. Esta acción no se puede deshacer.
        </p>
        {cancelar.isError && (
          <Aviso tono="error" className="mt-4">
            {mensajeDeError(cancelar.error)}
          </Aviso>
        )}
      </Modal>
    </div>
  );
}
