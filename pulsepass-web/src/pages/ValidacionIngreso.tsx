import { useState, type FormEvent } from 'react';
import { esApiError } from '../api/client';
import { DatosTicket } from '../components/tickets/DatosTicket';
import { Aviso } from '../components/ui/Aviso';
import { Badge } from '../components/ui/Badge';
import { Boton } from '../components/ui/Boton';
import { Campo } from '../components/ui/Campo';
import { EnlaceBoton } from '../components/ui/EnlaceBoton';
import { Esqueleto } from '../components/ui/Cargando';
import { EstadoError } from '../components/ui/EstadoError';
import { Selector } from '../components/ui/Selector';
import { mensajeDeError } from '../lib/errores';
import { useEventosPublicados } from '../hooks/useEventos';
import { useMarcarTicketUsado, useTicket } from '../hooks/useTickets';
import { useTitulo } from '../hooks/useTitulo';
import { RUTAS } from '../lib/rutas';
import type { EstadoTicket } from '../types/dominio';

const NOTA_ESTADO: Record<EstadoTicket, string | null> = {
  PAID: null,
  RESERVED: 'Este ticket está reservado, todavía no está pagado.',
  USED: 'Este ticket ya fue usado.',
  CANCELLED: 'Este ticket fue cancelado.',
};

export default function ValidacionIngreso() {
  useTitulo('Validar ingreso');
  const [entrada, setEntrada] = useState('');
  const [codigo, setCodigo] = useState<string | null>(null);
  const [eventoElegido, setEventoElegido] = useState('');
  const [validado, setValidado] = useState(false);

  const consulta = useTicket(codigo ?? undefined);
  const marcar = useMarcarTicketUsado();
  const eventos = useEventosPublicados();

  const buscar = (e: FormEvent) => {
    e.preventDefault();
    const limpio = entrada.trim();
    if (limpio === '') return;
    marcar.reset();
    setValidado(false);
    setCodigo(limpio);
  };

  const validar = (ticketCode: string) => {
    marcar.mutate(ticketCode, { onSuccess: () => setValidado(true) });
  };

  const ticket = consulta.data;
  const noExiste = consulta.isError && esApiError(consulta.error) && consulta.error.status === 404;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-4xl sm:text-5xl">Validar ingreso</h1>

      <section aria-labelledby="titulo-buscar" className="rounded-3xl border border-borde bg-superficie p-6 shadow-tarjeta sm:p-8">
        <h2 id="titulo-buscar" className="mb-4 text-2xl">
          Revisar un ticket
        </h2>
        <form onSubmit={buscar} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Campo className="flex-1" etiqueta="Código del ticket" value={entrada} onChange={(e) => setEntrada(e.target.value)} autoComplete="off" />
          <Boton type="submit" disabled={entrada.trim() === ''}>
            Buscar
          </Boton>
        </form>

        <div className="mt-6" aria-live="polite">
          {codigo !== null && consulta.isPending && <Esqueleto className="h-40" />}
          {noExiste && <Aviso tono="error">No encontramos un ticket con el código «{codigo}».</Aviso>}
          {consulta.isError && !noExiste && <EstadoError error={consulta.error} onReintentar={() => void consulta.refetch()} />}

          {ticket && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-borde bg-superficie-2 p-4">
                <p className="break-all font-mono text-lg font-bold">{ticket.ticketCode}</p>
                <Badge tono={ticket.status} />
              </div>
              <DatosTicket ticket={ticket} />

              {validado && <Aviso tono="exito">Ingreso validado: el ticket quedó marcado como usado.</Aviso>}
              {marcar.isError && <Aviso tono="error">{mensajeDeError(marcar.error)}</Aviso>}
              {!validado && NOTA_ESTADO[ticket.status] && <Aviso tono="aviso">{NOTA_ESTADO[ticket.status]}</Aviso>}

              {ticket.status === 'PAID' && !validado && (
                <Boton onClick={() => validar(ticket.ticketCode)} cargando={marcar.isPending}>
                  Validar ingreso
                </Boton>
              )}
            </div>
          )}
        </div>
      </section>

      <section aria-labelledby="titulo-lista" className="rounded-3xl border border-borde bg-superficie p-6 shadow-tarjeta sm:p-8">
        <h2 id="titulo-lista" className="mb-4 text-2xl">
          Tickets pagados por evento
        </h2>
        {eventos.isPending && <Esqueleto className="h-20" />}
        {eventos.isError && <EstadoError error={eventos.error} titulo="No pudimos cargar los eventos" onReintentar={() => void eventos.refetch()} />}
        {eventos.data && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <Selector className="flex-1" etiqueta="Evento" value={eventoElegido} onChange={(e) => setEventoElegido(e.target.value)}>
              <option value="">Elige un evento…</option>
              {eventos.data.map((ev) => (
                <option key={ev.id} value={ev.eventCode}>
                  {ev.name}
                </option>
              ))}
            </Selector>
            {eventoElegido === '' ? (
              <Boton disabled>Ver tickets</Boton>
            ) : (
              <EnlaceBoton to={RUTAS.staffTickets(eventoElegido)}>Ver tickets</EnlaceBoton>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
