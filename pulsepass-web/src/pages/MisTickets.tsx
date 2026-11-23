import { useState } from 'react';
import { TarjetaTicket } from '../components/tickets/TarjetaTicket';
import { EnlaceBoton } from '../components/ui/EnlaceBoton';
import { Esqueleto } from '../components/ui/Cargando';
import { EstadoError } from '../components/ui/EstadoError';
import { EstadoVacio } from '../components/ui/EstadoVacio';
import { IconoTicket } from '../components/ui/iconos';
import { useMisTickets } from '../hooks/useTickets';
import { useTitulo } from '../hooks/useTitulo';
import { FILTROS_TICKETS, filtrarTickets, type FiltroTickets } from '../lib/tickets';
import { RUTAS } from '../lib/rutas';

export default function MisTickets() {
  useTitulo('Mis tickets');
  const [filtro, setFiltro] = useState<FiltroTickets>('TODOS');
  const consulta = useMisTickets();
  const tickets = consulta.data ? filtrarTickets(consulta.data, filtro) : [];

  return (
    <div className="space-y-6">
      <h1 className="text-4xl sm:text-5xl">Mis tickets</h1>

      {consulta.isPending && (
        <div role="status" aria-busy="true" aria-label="Cargando tus tickets" className="space-y-4">
          {Array.from({ length: 3 }, (_, i) => (
            <Esqueleto key={i} className="h-28" />
          ))}
        </div>
      )}
      {consulta.isError && <EstadoError error={consulta.error} titulo="No pudimos cargar tus tickets" onReintentar={() => void consulta.refetch()} />}

      {consulta.data &&
        (consulta.data.length === 0 ? (
          <EstadoVacio
            icono={<IconoTicket />}
            titulo="Aún no tienes tickets"
            descripcion="Cuando compres una entrada, la verás aquí."
            accion={<EnlaceBoton to={RUTAS.eventos}>Ver la cartelera</EnlaceBoton>}
          />
        ) : (
          <>
            <div role="group" aria-label="Filtrar por estado" className="flex flex-wrap gap-2">
              {FILTROS_TICKETS.map((f) => (
                <button
                  key={f.valor}
                  type="button"
                  aria-pressed={filtro === f.valor}
                  onClick={() => setFiltro(f.valor)}
                  className={
                    filtro === f.valor
                      ? 'min-h-10 rounded-full bg-primario px-4 text-sm font-bold text-tinta-primario'
                      : 'min-h-10 rounded-full border border-borde bg-superficie px-4 text-sm font-bold hover:bg-superficie-2'
                  }
                >
                  {f.etiqueta}
                </button>
              ))}
            </div>
            {tickets.length === 0 ? (
              <EstadoVacio titulo="No tienes tickets con este estado" />
            ) : (
              <ul className="grid gap-4 lg:grid-cols-2">
                {tickets.map((t) => (
                  <li key={t.id}>
                    <TarjetaTicket ticket={t} />
                  </li>
                ))}
              </ul>
            )}
          </>
        ))}
    </div>
  );
}
