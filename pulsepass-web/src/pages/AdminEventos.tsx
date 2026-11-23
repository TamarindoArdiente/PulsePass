import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { useQueries } from '@tanstack/react-query';
import { obtenerEvento } from '../api/eventos';
import { Badge } from '../components/ui/Badge';
import { Boton } from '../components/ui/Boton';
import { Campo } from '../components/ui/Campo';
import { Esqueleto } from '../components/ui/Cargando';
import { EnlaceBoton } from '../components/ui/EnlaceBoton';
import { EstadoError } from '../components/ui/EstadoError';
import { EstadoVacio } from '../components/ui/EstadoVacio';
import { IconoCalendario } from '../components/ui/iconos';
import { Tabla, type Columna } from '../components/ui/Tabla';
import { useEventosPublicados } from '../hooks/useEventos';
import { useTitulo } from '../hooks/useTitulo';
import { CLAVES } from '../lib/claves';
import { leerCodigosAdmin, olvidarCodigoAdmin, recordarCodigoAdmin } from '../lib/eventosAdmin';
import { formatearFechaHora } from '../lib/formato';
import { RUTAS } from '../lib/rutas';
import type { EstadoEvento } from '../types/dominio';

interface FilaEvento {
  eventCode: string;
  nombre: string | null;
  estado: EstadoEvento | null;
  fecha: string | null;
  /** true si el código viene de la lista guardada en este navegador (se puede quitar). */
  recordado: boolean;
}

export default function AdminEventos() {
  useTitulo('Administrar eventos');
  const navegar = useNavigate();
  const publicados = useEventosPublicados();
  const [recordados, setRecordados] = useState<string[]>(() => leerCodigosAdmin());
  const [codigo, setCodigo] = useState('');

  // Los borradores se piden uno por uno, por código (la API no los lista).
  const detalles = useQueries({
    queries: recordados.map((c) => ({
      queryKey: CLAVES.eventos.detalle(c),
      queryFn: () => obtenerEvento(c),
    })),
  });

  const filas = new Map<string, FilaEvento>();
  for (const e of publicados.data ?? []) {
    filas.set(e.eventCode, { eventCode: e.eventCode, nombre: e.name, estado: e.status, fecha: e.eventDate, recordado: false });
  }
  recordados.forEach((c, i) => {
    const d = detalles[i]?.data;
    // El detalle trae el estado real (también de borradores), así que prevalece sobre la lista pública.
    filas.set(c, {
      eventCode: c,
      nombre: d?.name ?? filas.get(c)?.nombre ?? null,
      estado: d?.status ?? filas.get(c)?.estado ?? null,
      fecha: d?.eventDate ?? filas.get(c)?.fecha ?? null,
      recordado: true,
    });
  });
  const lista = [...filas.values()].toSorted((a, b) => (b.fecha ?? '').localeCompare(a.fecha ?? ''));

  const abrir = (e: FormEvent) => {
    e.preventDefault();
    const limpio = codigo.trim();
    if (limpio === '') return;
    setRecordados(recordarCodigoAdmin(limpio));
    void navegar(RUTAS.adminEvento(limpio));
  };

  const columnas: readonly Columna<FilaEvento>[] = [
    { clave: 'codigo', encabezado: 'Código', celda: (f) => <span className="font-mono text-sm">{f.eventCode}</span> },
    { clave: 'nombre', encabezado: 'Nombre', celda: (f) => f.nombre ?? '—' },
    { clave: 'estado', encabezado: 'Estado', celda: (f) => (f.estado ? <Badge tono={f.estado} /> : '—') },
    { clave: 'fecha', encabezado: 'Fecha', celda: (f) => (f.fecha ? formatearFechaHora(f.fecha) : '—') },
    {
      clave: 'acciones',
      encabezado: 'Acciones',
      encabezadoOculto: true,
      alinear: 'derecha',
      celda: (f) => (
        <span className="inline-flex flex-wrap justify-end gap-2">
          <EnlaceBoton to={RUTAS.adminEvento(f.eventCode)} variante="secundario" tamano="pequeno" aria-label={`Gestionar ${f.nombre ?? f.eventCode}`}>
            Gestionar
          </EnlaceBoton>
          {f.recordado && (
            <Boton
              variante="fantasma"
              className="min-h-10 px-4 text-sm"
              aria-label={`Quitar ${f.eventCode} de mi lista`}
              onClick={() => setRecordados(olvidarCodigoAdmin(f.eventCode))}
            >
              Quitar
            </Boton>
          )}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-4xl sm:text-5xl">Administrar eventos</h1>
        <EnlaceBoton to={RUTAS.adminNuevo}>Crear evento</EnlaceBoton>
      </div>

      <section aria-labelledby="titulo-abrir" className="rounded-3xl border border-borde bg-superficie p-6 shadow-tarjeta">
        <h2 id="titulo-abrir" className="mb-1 text-2xl">
          Abrir un evento por código
        </h2>
        <p className="mb-4 text-tinta-suave">Los borradores no aparecen en la cartelera: ábrelos con su código.</p>
        <form onSubmit={abrir} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Campo className="flex-1" etiqueta="Código del evento" value={codigo} onChange={(e) => setCodigo(e.target.value)} autoComplete="off" />
          <Boton type="submit" disabled={codigo.trim() === ''}>
            Abrir
          </Boton>
        </form>
      </section>

      {publicados.isPending && <Esqueleto className="h-56" />}
      {publicados.isError && <EstadoError error={publicados.error} titulo="No pudimos cargar los eventos publicados" onReintentar={() => void publicados.refetch()} />}

      {publicados.data &&
        (lista.length === 0 ? (
          <EstadoVacio
            icono={<IconoCalendario />}
            titulo="Todavía no hay eventos"
            descripcion="Crea el primero: quedará como borrador hasta que lo publiques."
            accion={<EnlaceBoton to={RUTAS.adminNuevo}>Crear evento</EnlaceBoton>}
          />
        ) : (
          <Tabla columnas={columnas} filas={lista} claveFila={(f) => f.eventCode} descripcion="Eventos" />
        ))}
    </div>
  );
}
