import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { esApiError } from '../api/client';
import { AreaTexto } from '../components/ui/AreaTexto';
import { Aviso } from '../components/ui/Aviso';
import { Boton } from '../components/ui/Boton';
import { Campo } from '../components/ui/Campo';
import { EstadoError } from '../components/ui/EstadoError';
import { IconoFlechaIzquierda } from '../components/ui/iconos';
import { Selector } from '../components/ui/Selector';
import { useCrearEvento } from '../hooks/useEventos';
import { useSedesActivas } from '../hooks/useSedes';
import { useTitulo } from '../hooks/useTitulo';
import { CATEGORIAS, LISTA_CATEGORIAS } from '../lib/categorias';
import { erroresPorCampo, mensajeDeError } from '../lib/errores';
import { recordarCodigoAdmin } from '../lib/eventosAdmin';
import { RUTAS } from '../lib/rutas';
import { esquemaCrearEvento, type SolicitudCrearEvento } from '../types/solicitudes';

const CAMPOS: readonly (keyof SolicitudCrearEvento)[] = ['eventCode', 'name', 'description', 'category', 'eventDate', 'minimumAge', 'venueCode'];

export default function AdminNuevoEvento() {
  useTitulo('Crear evento');
  const navegar = useNavigate();
  const crear = useCrearEvento();
  const sedes = useSedesActivas();
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SolicitudCrearEvento>({
    resolver: zodResolver(esquemaCrearEvento),
    defaultValues: { eventCode: '', name: '', description: '', category: 'MUSIC', eventDate: '', minimumAge: 0, venueCode: '' },
  });

  const enviar = handleSubmit((datos) => {
    setErrorGeneral(null);
    const cuerpo: SolicitudCrearEvento = {
      ...datos,
      description: datos.description?.trim() ? datos.description.trim() : undefined,
      // <input type="datetime-local"> entrega "2026-12-12T20:00"; el backend espera segundos.
      eventDate: datos.eventDate.length === 16 ? `${datos.eventDate}:00` : datos.eventDate,
    };
    crear.mutate(cuerpo, {
      onSuccess: (evento) => {
        recordarCodigoAdmin(evento.eventCode);
        void navegar(RUTAS.adminEvento(evento.eventCode), { state: { creado: true }, replace: true });
      },
      onError: (error) => {
        const detalles = erroresPorCampo(error);
        let marcado = false;
        for (const campo of CAMPOS) {
          const mensaje = detalles[campo];
          if (mensaje) {
            setError(campo, { message: mensaje });
            marcado = true;
          }
        }
        // 409 (p. ej. código repetido) y demás: el mensaje de la regla de negocio, tal cual.
        if (!marcado) setErrorGeneral(esApiError(error) ? mensajeDeError(error) : 'No pudimos crear el evento.');
      },
    });
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link to={RUTAS.adminEventos} className="inline-flex items-center gap-1.5 font-bold text-acento hover:underline">
        <IconoFlechaIzquierda /> Volver a eventos
      </Link>

      <div className="rounded-3xl border border-borde bg-superficie p-6 shadow-tarjeta sm:p-8">
        <h1 className="mb-1 text-3xl sm:text-4xl">Crear evento</h1>
        <p className="mb-6 text-tinta-suave">Se guarda como borrador. Podrás asociar artistas y publicarlo después.</p>

        {errorGeneral && (
          <Aviso tono="error" className="mb-5">
            {errorGeneral}
          </Aviso>
        )}

        <form onSubmit={(e) => void enviar(e)} noValidate className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Código" ayuda="Único, sin espacios. Ej. FEST-2026." autoComplete="off" error={errors.eventCode?.message} {...register('eventCode')} />
          <Campo etiqueta="Nombre" autoComplete="off" error={errors.name?.message} {...register('name')} />
          <AreaTexto className="sm:col-span-2" etiqueta="Descripción (opcional)" error={errors.description?.message} {...register('description')} />
          <Selector etiqueta="Categoría" {...register('category')}>
            {LISTA_CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {CATEGORIAS[c].etiqueta}
              </option>
            ))}
          </Selector>
          <Campo etiqueta="Fecha y hora" type="datetime-local" error={errors.eventDate?.message} {...register('eventDate')} />
          <Campo
            etiqueta="Edad mínima"
            type="number"
            min={0}
            inputMode="numeric"
            ayuda="0 si es para todo público."
            error={errors.minimumAge?.message}
            {...register('minimumAge', { valueAsNumber: true })}
          />
          <div>
            <Selector etiqueta="Sede" disabled={sedes.isPending || sedes.isError} {...register('venueCode')}>
              <option value="">{sedes.isPending ? 'Cargando sedes…' : 'Elige una sede…'}</option>
              {(sedes.data ?? []).map((s) => (
                <option key={s.id} value={s.code}>
                  {s.name} · {s.city}
                </option>
              ))}
            </Selector>
            {errors.venueCode?.message && (
              <p role="alert" className="mt-1.5 text-sm font-medium text-red-600 dark:text-red-400">
                {errors.venueCode.message}
              </p>
            )}
          </div>

          {sedes.isError && (
            <div className="sm:col-span-2">
              <EstadoError error={sedes.error} titulo="No pudimos cargar las sedes" onReintentar={() => void sedes.refetch()} />
            </div>
          )}

          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <Boton type="submit" cargando={crear.isPending}>
              Crear evento
            </Boton>
            <Link to={RUTAS.adminEventos} className="inline-flex min-h-12 items-center px-4 font-bold text-acento hover:underline">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
