import clsx from 'clsx';
import { useLocation } from 'react-router';
import { RUTAS } from '../../lib/rutas';
import type { AccionCompra } from '../../lib/compra';
import { TIPOS_TICKET } from '../../lib/tiposTicket';
import type { TipoTicket } from '../../types/dominio';
import { Boton } from '../ui/Boton';
import { Esqueleto } from '../ui/Cargando';
import { EnlaceBoton } from '../ui/EnlaceBoton';
import { IconoInfo } from '../ui/iconos';

interface PropsPanelCompra {
  accion: AccionCompra;
  tipo: TipoTicket;
  onTipo: (tipo: TipoTicket) => void;
  onComprar: () => void;
}

/** Panel lateral de "Entradas". Qué muestra depende de la sesión, el rol y el estado del evento (PRD §9.5). */
export function PanelCompra({ accion, tipo, onTipo, onComprar }: PropsPanelCompra) {
  const ubicacion = useLocation();

  if (accion.tipo === 'oculto') return null;

  return (
    <aside aria-labelledby="titulo-entradas" className="rounded-3xl border border-borde bg-superficie p-5 shadow-tarjeta lg:sticky lg:top-24">
      <h2 id="titulo-entradas" className="text-2xl">
        Entradas
      </h2>

      {accion.tipo === 'cargando' && <Esqueleto className="mt-4 h-40" />}

      {accion.tipo !== 'cargando' && (
        <fieldset disabled={accion.tipo === 'bloqueado'} className="mt-4 min-w-0">
          <legend className="mb-2 text-sm font-bold">Tipo de entrada</legend>
          <div className="space-y-2">
            {TIPOS_TICKET.map((t) => (
              <label
                key={t.valor}
                className={clsx(
                  'flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-3 transition-colors has-disabled:cursor-not-allowed has-disabled:opacity-60',
                  tipo === t.valor ? 'border-primario bg-superficie-2' : 'border-borde hover:border-tinta-suave',
                )}
              >
                <input type="radio" name="tipo-entrada" value={t.valor} checked={tipo === t.valor} onChange={() => onTipo(t.valor)} className="size-4 accent-[var(--primario)]" />
                <span>
                  <span className="block font-bold">{t.etiqueta}</span>
                  <span className="block text-xs text-tinta-suave">{t.descripcion}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="mt-5">
        {accion.tipo === 'permitido' && (
          <Boton className="w-full" onClick={onComprar}>
            Comprar entrada
          </Boton>
        )}
        {accion.tipo === 'anonimo' && (
          <EnlaceBoton className="w-full" to={RUTAS.login} state={{ desde: ubicacion.pathname }}>
            Inicia sesión para comprar
          </EnlaceBoton>
        )}
        {accion.tipo === 'bloqueado' && (
          <>
            <Boton className="w-full" disabled>
              Comprar entrada
            </Boton>
            <p className="mt-3 flex items-start gap-2 text-sm font-medium text-tinta-suave">
              <IconoInfo className="mt-0.5 shrink-0" /> {accion.motivo}
            </p>
          </>
        )}
        <p className="mt-3 text-xs text-tinta-suave">El precio lo define el sistema al confirmar.</p>
      </div>
    </aside>
  );
}
