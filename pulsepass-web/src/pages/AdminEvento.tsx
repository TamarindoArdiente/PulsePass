import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router';
import { AvatarArtista } from '../components/artistas/AvatarArtista';
import { Aviso } from '../components/ui/Aviso';
import { Badge } from '../components/ui/Badge';
import { Boton } from '../components/ui/Boton';
import { Esqueleto } from '../components/ui/Cargando';
import { EnlaceBoton } from '../components/ui/EnlaceBoton';
import { ErrorDeRecurso } from '../components/ui/Resultado';
import { IconoFlechaIzquierda } from '../components/ui/iconos';
import { Modal } from '../components/ui/Modal';
import { Selector } from '../components/ui/Selector';
import { useArtistasActivos } from '../hooks/useArtistas';
import { useAsociarArtista, useEvento, usePublicarEvento } from '../hooks/useEventos';
import { useTitulo } from '../hooks/useTitulo';
import { CATEGORIAS } from '../lib/categorias';
import { mensajeDeError } from '../lib/errores';
import { formatearFechaHora } from '../lib/formato';
import { leerEstadoNavegacion } from '../lib/navegacion';
import { RUTAS } from '../lib/rutas';

export default function AdminEvento() {
  const { eventCode = '' } = useParams();
  const ubicacion = useLocation();
  const consulta = useEvento(eventCode);
  const artistas = useArtistasActivos();
  const publicar = usePublicarEvento();
  const asociar = useAsociarArtista(eventCode);
  const [creado, setCreado] = useState(() => leerEstadoNavegacion(ubicacion.state).creado === true);
  const [confirmando, setConfirmando] = useState(false);
  const [publicado, setPublicado] = useState(false);
  const [artistaElegido, setArtistaElegido] = useState('');
  const [asociadoOk, setAsociadoOk] = useState(false);

  const evento = consulta.data;
  useTitulo(evento ? `Gestionar ${evento.name}` : 'Gestionar evento');

  if (consulta.isPending) return <Esqueleto className="h-72" />;
  if (consulta.isError || evento === undefined) {
    return (
      <ErrorDeRecurso
        error={consulta.error}
        recurso="el evento"
        volverA={RUTAS.adminEventos}
        textoVolver="Volver a eventos"
        onReintentar={() => void consulta.refetch()}
      />
    );
  }

  const yaAsociados = new Set(evento.artists.map((a) => a.id));
  const disponibles = (artistas.data ?? []).filter((a) => !yaAsociados.has(a.id));

  const cerrarModal = () => {
    setConfirmando(false);
    publicar.reset();
  };

  const confirmarPublicacion = () => {
    publicar.mutate(evento.eventCode, {
      onSuccess: () => {
        setConfirmando(false);
        setPublicado(true);
      },
    });
  };

  const agregarArtista = () => {
    if (artistaElegido === '') return;
    setAsociadoOk(false);
    asociar.mutate(Number(artistaElegido), {
      onSuccess: () => {
        setArtistaElegido('');
        setAsociadoOk(true);
      },
    });
  };

  return (
    <div className="space-y-8">
      <Link to={RUTAS.adminEventos} className="inline-flex items-center gap-1.5 font-bold text-acento hover:underline">
        <IconoFlechaIzquierda /> Volver a eventos
      </Link>

      {creado && (
        <Aviso tono="exito" onCerrar={() => setCreado(false)} duracionMs={4000}>
          Evento creado como borrador.
        </Aviso>
      )}
      {publicado && (
        <Aviso tono="exito" onCerrar={() => setPublicado(false)} duracionMs={4000}>
          Evento publicado: ya aparece en la cartelera.
        </Aviso>
      )}

      <header className="rounded-3xl border border-borde bg-superficie p-6 shadow-tarjeta sm:p-8">
        <p className="mb-2 flex flex-wrap items-center gap-2 text-sm font-bold text-tinta-suave">
          <span className="font-mono">{evento.eventCode}</span>
          <Badge tono={evento.status} />
        </p>
        <h1 className="text-3xl sm:text-5xl">{evento.name}</h1>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-bold text-tinta-suave">Categoría</dt>
            <dd className="text-lg">{CATEGORIAS[evento.category].etiqueta}</dd>
          </div>
          <div>
            <dt className="text-sm font-bold text-tinta-suave">Fecha</dt>
            <dd className="text-lg">{formatearFechaHora(evento.eventDate)}</dd>
          </div>
          <div>
            <dt className="text-sm font-bold text-tinta-suave">Sede</dt>
            <dd className="text-lg">{evento.venueName}</dd>
          </div>
          <div>
            <dt className="text-sm font-bold text-tinta-suave">Edad mínima</dt>
            <dd className="text-lg">{evento.minimumAge ? `${evento.minimumAge} años` : 'Todo público'}</dd>
          </div>
        </dl>
        {evento.description && <p className="mt-5 whitespace-pre-line">{evento.description}</p>}
        <div className="mt-6 flex flex-wrap gap-3">
          {evento.status === 'DRAFT' && <Boton onClick={() => setConfirmando(true)}>Publicar evento</Boton>}
          <EnlaceBoton to={RUTAS.evento(evento.eventCode)} variante="secundario">
            Ver página pública
          </EnlaceBoton>
          <EnlaceBoton to={RUTAS.staffTickets(evento.eventCode)} variante="secundario">
            Ver tickets pagados
          </EnlaceBoton>
        </div>
      </header>

      <section aria-labelledby="titulo-artistas-admin" className="rounded-3xl border border-borde bg-superficie p-6 shadow-tarjeta sm:p-8">
        <h2 id="titulo-artistas-admin" className="mb-4 text-2xl">
          Artistas
        </h2>
        {evento.artists.length === 0 ? (
          <p className="mb-5 text-tinta-suave">Todavía no hay artistas asociados.</p>
        ) : (
          <ul className="mb-6 flex flex-wrap gap-x-6 gap-y-3">
            {evento.artists.map((a) => (
              <li key={a.id} className="flex items-center gap-2.5">
                <AvatarArtista nombre={a.stageName} className="size-11 text-sm" />
                <span className="font-bold">{a.stageName}</span>
              </li>
            ))}
          </ul>
        )}

        {asociadoOk && (
          <Aviso tono="exito" className="mb-4" onCerrar={() => setAsociadoOk(false)} duracionMs={4000}>
            Artista asociado.
          </Aviso>
        )}
        {asociar.isError && (
          <Aviso tono="error" className="mb-4">
            {mensajeDeError(asociar.error)}
          </Aviso>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Selector
            className="flex-1"
            etiqueta="Asociar un artista"
            value={artistaElegido}
            onChange={(e) => setArtistaElegido(e.target.value)}
            disabled={artistas.isPending || disponibles.length === 0}
          >
            <option value="">
              {artistas.isPending ? 'Cargando artistas…' : disponibles.length === 0 ? 'No hay más artistas activos' : 'Elige un artista…'}
            </option>
            {disponibles.map((a) => (
              <option key={a.id} value={String(a.id)}>
                {a.stageName} · {a.genre}
              </option>
            ))}
          </Selector>
          <Boton onClick={agregarArtista} disabled={artistaElegido === ''} cargando={asociar.isPending}>
            Asociar
          </Boton>
        </div>
      </section>

      <Modal
        abierto={confirmando}
        onCerrar={cerrarModal}
        titulo="¿Publicar este evento?"
        pie={
          <>
            <Boton variante="secundario" onClick={cerrarModal} disabled={publicar.isPending}>
              Todavía no
            </Boton>
            <Boton onClick={confirmarPublicacion} cargando={publicar.isPending}>
              Publicar
            </Boton>
          </>
        }
      >
        <p>
          <strong>{evento.name}</strong> aparecerá en la cartelera y las personas podrán comprar entradas.
        </p>
        {publicar.isError && (
          <Aviso tono="error" className="mt-4">
            {mensajeDeError(publicar.error)}
          </Aviso>
        )}
      </Modal>
    </div>
  );
}
