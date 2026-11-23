import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { AvatarArtista } from '../components/artistas/AvatarArtista';
import { IconoCategoria } from '../components/eventos/IconoCategoria';
import { ModalConfirmarCompra } from '../components/eventos/ModalConfirmarCompra';
import { PanelCompra } from '../components/eventos/PanelCompra';
import { Badge } from '../components/ui/Badge';
import { Boton } from '../components/ui/Boton';
import { Esqueleto } from '../components/ui/Cargando';
import { EnlaceBoton } from '../components/ui/EnlaceBoton';
import { EstadoError } from '../components/ui/EstadoError';
import { EstadoVacio } from '../components/ui/EstadoVacio';
import { IconoCalendario, IconoFlechaIzquierda, IconoUbicacion } from '../components/ui/iconos';
import { esApiError } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { useEvento } from '../hooks/useEventos';
import { useSede } from '../hooks/useSedes';
import { useComprarTicket } from '../hooks/useTickets';
import { useTitulo } from '../hooks/useTitulo';
import { CATEGORIAS } from '../lib/categorias';
import { accionDeCompra } from '../lib/compra';
import { formatearFechaHora } from '../lib/formato';
import { RUTAS } from '../lib/rutas';
import type { TipoTicket } from '../types/dominio';

export default function DetalleEvento() {
  const { eventCode } = useParams();
  const navegar = useNavigate();
  const { sesion } = useAuth();
  const consulta = useEvento(eventCode);
  const sede = useSede(consulta.data?.venueCode);
  const comprar = useComprarTicket();
  const [tipo, setTipo] = useState<TipoTicket>('GENERAL');
  const [confirmando, setConfirmando] = useState(false);

  useTitulo(consulta.data?.name ?? 'Evento');

  if (consulta.isPending) {
    return (
      <div aria-busy="true" role="status" aria-label="Cargando evento" className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <Esqueleto className="h-96" />
        <Esqueleto className="h-80" />
      </div>
    );
  }

  if (consulta.isError) {
    // 404 también cubre un borrador para quien no es personal: se muestra igual que un evento inexistente.
    if (esApiError(consulta.error) && consulta.error.status === 404) {
      return (
        <EstadoVacio
          titulo="Evento no disponible"
          descripcion="Puede que ya no exista o que todavía no esté publicado."
          accion={<EnlaceBoton to={RUTAS.eventos}>Volver a la cartelera</EnlaceBoton>}
        />
      );
    }
    return <EstadoError error={consulta.error} onReintentar={() => void consulta.refetch()} />;
  }

  const evento = consulta.data;
  const categoria = CATEGORIAS[evento.category];
  const accion = accionDeCompra(sesion, evento.status);
  const email = sesion.estado === 'autenticado' ? sesion.usuario.email : null;
  const esPersonal = sesion.estado === 'autenticado' && (sesion.usuario.roles.includes('STAFF') || sesion.usuario.roles.includes('ADMIN'));
  const esAdmin = sesion.estado === 'autenticado' && sesion.usuario.roles.includes('ADMIN');

  const cerrarModal = () => {
    setConfirmando(false);
    comprar.reset();
  };

  const confirmarCompra = () => {
    comprar.mutate(
      { eventCode: evento.eventCode, type: tipo },
      {
        onSuccess: (ticket) => {
          setConfirmando(false);
          void navegar(RUTAS.confirmacion(ticket.ticketCode));
        },
      },
    );
  };

  return (
    <div className={accion.tipo === 'permitido' ? 'pb-24 lg:pb-0' : undefined}>
      <Link to={RUTAS.eventos} className="mb-5 inline-flex items-center gap-1.5 font-bold text-acento hover:underline">
        <IconoFlechaIzquierda /> Volver a la cartelera
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
        <article className="min-w-0 overflow-hidden rounded-3xl border border-borde bg-superficie shadow-tarjeta">
          <div className={`flex h-40 items-center justify-center text-white sm:h-52 ${categoria.panel}`}>
            <IconoCategoria categoria={evento.category} className="text-8xl opacity-90" />
          </div>

          <div className="space-y-6 p-6 sm:p-8">
            <header>
              <p className="mb-2 flex flex-wrap items-center gap-2 text-sm font-bold text-tinta-suave">
                {categoria.etiqueta}
                <Badge tono={evento.status} />
              </p>
              <h1 className="text-3xl sm:text-5xl">{evento.name}</h1>
              <ul className="mt-4 space-y-1.5 text-tinta-suave">
                <li className="flex items-center gap-2">
                  <IconoCalendario /> {formatearFechaHora(evento.eventDate)}
                </li>
                {evento.minimumAge != null && evento.minimumAge > 0 && <li>Edad mínima: {evento.minimumAge} años</li>}
              </ul>
            </header>

            {evento.description && <p className="whitespace-pre-line leading-relaxed">{evento.description}</p>}

            <section aria-labelledby="titulo-artistas-evento">
              <h2 id="titulo-artistas-evento" className="mb-3 text-2xl">
                Artistas
              </h2>
              {evento.artists.length === 0 ? (
                <p className="text-tinta-suave">Aún no hay artistas confirmados.</p>
              ) : (
                <ul className="flex flex-wrap gap-x-6 gap-y-3">
                  {evento.artists.map((a) => (
                    <li key={a.id}>
                      <Link to={RUTAS.artista(a.id)} className="group flex items-center gap-2.5">
                        <AvatarArtista nombre={a.stageName} className="size-11 text-sm" />
                        <span className="font-bold group-hover:underline">{a.stageName}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section aria-labelledby="titulo-sede">
              <h2 id="titulo-sede" className="mb-3 text-2xl">
                Sede
              </h2>
              <Link to={RUTAS.sede(evento.venueCode)} className="inline-flex items-start gap-2 hover:underline">
                <IconoUbicacion className="mt-1 shrink-0" />
                <span>
                  <span className="block font-bold">{evento.venueName}</span>
                  {sede.data && (
                    <span className="block text-sm text-tinta-suave">
                      {sede.data.city} · Capacidad {sede.data.capacity}
                    </span>
                  )}
                </span>
              </Link>
            </section>

            {esPersonal && (
              <section aria-labelledby="titulo-personal" className="rounded-2xl border border-borde bg-superficie-2 p-4">
                <h2 id="titulo-personal" className="mb-3 text-lg">
                  Acciones del personal
                </h2>
                <div className="flex flex-wrap gap-3">
                  <EnlaceBoton to={RUTAS.staffTickets(evento.eventCode)} variante="secundario" tamano="pequeno">
                    Ver tickets pagados
                  </EnlaceBoton>
                  {esAdmin && (
                    <EnlaceBoton to={RUTAS.adminEvento(evento.eventCode)} variante="secundario" tamano="pequeno">
                      Gestionar evento
                    </EnlaceBoton>
                  )}
                </div>
              </section>
            )}
          </div>
        </article>

        <PanelCompra accion={accion} tipo={tipo} onTipo={setTipo} onComprar={() => setConfirmando(true)} />
      </div>

      {/* Barra de compra fija en móvil */}
      {accion.tipo === 'permitido' && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-borde bg-fondo/95 p-3 backdrop-blur lg:hidden">
          <Boton className="w-full" onClick={() => setConfirmando(true)}>
            Comprar entrada
          </Boton>
        </div>
      )}

      {accion.tipo === 'permitido' && email !== null && (
        <ModalConfirmarCompra
          abierto={confirmando}
          evento={evento}
          tipo={tipo}
          email={email}
          cargando={comprar.isPending}
          error={comprar.error}
          onConfirmar={confirmarCompra}
          onCerrar={cerrarModal}
        />
      )}
    </div>
  );
}
