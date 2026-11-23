import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { Aviso } from '../components/ui/Aviso';
import { Badge } from '../components/ui/Badge';
import { Boton } from '../components/ui/Boton';
import { Campo } from '../components/ui/Campo';
import { Esqueleto } from '../components/ui/Cargando';
import { EstadoError } from '../components/ui/EstadoError';
import { EstadoVacio } from '../components/ui/EstadoVacio';
import { IconoBuscar, IconoFlechaIzquierda, IconoTicket } from '../components/ui/iconos';
import { Tabla, type Columna } from '../components/ui/Tabla';
import { mensajeDeError } from '../lib/errores';
import { useEvento } from '../hooks/useEventos';
import { useMarcarTicketUsado, useTicketsPagados } from '../hooks/useTickets';
import { useTitulo } from '../hooks/useTitulo';
import { normalizar } from '../lib/filtrosEventos';
import { formatearFechaHora, formatearPrecioCOP } from '../lib/formato';
import { RUTAS } from '../lib/rutas';
import { etiquetaTipo } from '../lib/tiposTicket';
import type { Ticket } from '../types/dominio';

export default function TicketsPagados() {
  const { eventCode } = useParams();
  const evento = useEvento(eventCode);
  const consulta = useTicketsPagados(eventCode);
  const marcar = useMarcarTicketUsado();
  const [q, setQ] = useState('');
  const [ultimoUsado, setUltimoUsado] = useState<string | null>(null);

  useTitulo(evento.data ? `Tickets de ${evento.data.name}` : 'Tickets pagados');

  const texto = normalizar(q);
  const tickets = (consulta.data ?? []).filter(
    (t) => texto === '' || normalizar(`${t.ticketCode} ${t.userEmail}`).includes(texto),
  );

  // Solo la fila que se está procesando muestra "Validando…".
  const procesando = marcar.isPending ? marcar.variables : null;

  const validar = (ticketCode: string) => {
    setUltimoUsado(null);
    marcar.mutate(ticketCode, { onSuccess: () => setUltimoUsado(ticketCode) });
  };

  const columnas: readonly Columna<Ticket>[] = [
    { clave: 'codigo', encabezado: 'Código', celda: (t) => <span className="font-mono text-sm">{t.ticketCode}</span> },
    { clave: 'correo', encabezado: 'Correo', celda: (t) => t.userEmail },
    { clave: 'tipo', encabezado: 'Tipo', celda: (t) => etiquetaTipo(t.type) },
    { clave: 'precio', encabezado: 'Precio', alinear: 'derecha', celda: (t) => formatearPrecioCOP(t.price) },
    { clave: 'compra', encabezado: 'Compra', celda: (t) => formatearFechaHora(t.purchaseDate) },
    { clave: 'estado', encabezado: 'Estado', celda: (t) => <Badge tono={t.status} /> },
    {
      clave: 'accion',
      encabezado: 'Acción',
      encabezadoOculto: true,
      alinear: 'derecha',
      celda: (t) => (
        <Boton
          variante="secundario"
          className="min-h-10 px-4 text-sm"
          cargando={procesando === t.ticketCode}
          disabled={procesando !== null}
          aria-label={`Marcar como usado el ticket ${t.ticketCode}`}
          onClick={() => validar(t.ticketCode)}
        >
          Marcar usado
        </Boton>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Link to={eventCode ? RUTAS.evento(eventCode) : RUTAS.eventos} className="inline-flex items-center gap-1.5 font-bold text-acento hover:underline">
        <IconoFlechaIzquierda /> Volver al evento
      </Link>

      <div>
        <h1 className="text-4xl sm:text-5xl">Tickets pagados</h1>
        {evento.data && <p className="mt-2 text-lg text-tinta-suave">{evento.data.name}</p>}
      </div>

      {ultimoUsado && (
        <Aviso tono="exito" onCerrar={() => setUltimoUsado(null)} duracionMs={4000}>
          Ticket {ultimoUsado} marcado como usado.
        </Aviso>
      )}
      {marcar.isError && <Aviso tono="error">{mensajeDeError(marcar.error)}</Aviso>}

      <form role="search" aria-label="Buscar tickets" onSubmit={(e) => e.preventDefault()} className="max-w-md">
        <Campo etiqueta="Buscar por código o correo" type="search" value={q} onChange={(e) => setQ(e.target.value)} />
      </form>

      {consulta.isPending && <Esqueleto className="h-56" />}
      {consulta.isError && <EstadoError error={consulta.error} titulo="No pudimos cargar los tickets" onReintentar={() => void consulta.refetch()} />}

      {consulta.data &&
        (consulta.data.length === 0 ? (
          <EstadoVacio icono={<IconoTicket />} titulo="Este evento no tiene tickets pagados" descripcion="Cuando alguien pague una entrada, aparecerá aquí." />
        ) : tickets.length === 0 ? (
          <EstadoVacio icono={<IconoBuscar />} titulo="Sin resultados para tu búsqueda" descripcion="Revisa el código o el correo." />
        ) : (
          <>
            <p role="status" className="text-sm font-medium text-tinta-suave">
              {tickets.length === 1 ? '1 ticket' : `${tickets.length} tickets`}
            </p>
            <Tabla columnas={columnas} filas={tickets} claveFila={(t) => t.id} descripcion="Tickets pagados del evento" />
          </>
        ))}
    </div>
  );
}
