import clsx from 'clsx';
import { useEffect, type ReactNode } from 'react';
import { IconoAlerta, IconoCerrar, IconoCheck, IconoInfo } from './iconos';

type TonoAviso = 'exito' | 'error' | 'info' | 'aviso';

const CLASES_TONO: Record<TonoAviso, string> = {
  exito: 'border-emerald-400/60 bg-emerald-100 text-emerald-900 dark:bg-emerald-400/15 dark:text-emerald-200',
  error: 'border-red-400/60 bg-red-100 text-red-900 dark:bg-red-400/15 dark:text-red-200',
  info: 'border-sky-400/60 bg-sky-100 text-sky-900 dark:bg-sky-400/15 dark:text-sky-200',
  aviso: 'border-amber-400/60 bg-amber-100 text-amber-900 dark:bg-amber-400/15 dark:text-amber-200',
};

interface PropsAviso {
  tono: TonoAviso;
  children: ReactNode;
  onCerrar?: () => void;
  /** Cierra solo tras N ms (éxito de mutación: 4 s, PRD §9.20). Requiere onCerrar. */
  duracionMs?: number;
  className?: string;
}

/** Los errores usan role="alert" (se leen de inmediato); el resto, aria-live="polite". */
export function Aviso({ tono, children, onCerrar, duracionMs, className }: PropsAviso) {
  useEffect(() => {
    if (duracionMs === undefined || onCerrar === undefined) return;
    const id = window.setTimeout(onCerrar, duracionMs);
    return () => window.clearTimeout(id);
  }, [duracionMs, onCerrar]);

  const Icono = tono === 'exito' ? IconoCheck : tono === 'info' ? IconoInfo : IconoAlerta;

  return (
    <div
      role={tono === 'error' ? 'alert' : 'status'}
      className={clsx('flex items-start gap-3 rounded-2xl border p-3.5 text-sm font-medium', CLASES_TONO[tono], className)}
    >
      <Icono className="mt-0.5 shrink-0 text-lg" />
      <div className="min-w-0 flex-1">{children}</div>
      {onCerrar && (
        <button type="button" onClick={onCerrar} aria-label="Cerrar aviso" className="shrink-0 rounded-full p-0.5">
          <IconoCerrar />
        </button>
      )}
    </div>
  );
}
