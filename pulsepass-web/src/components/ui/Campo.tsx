import clsx from 'clsx';
import { useId, type ComponentProps, type ReactNode } from 'react';
import { IconoAlerta } from './iconos';

interface PropsCampo extends ComponentProps<'input'> {
  etiqueta: string;
  error?: string;
  ayuda?: string;
  /** Elemento al borde derecho del campo (p. ej. el botón de mostrar contraseña). */
  adorno?: ReactNode;
}

export function Campo({ etiqueta, error, ayuda, adorno, className, id, ...resto }: PropsCampo) {
  const idAuto = useId();
  const idCampo = id ?? idAuto;
  const idMensaje = `${idCampo}-mensaje`;
  const hayMensaje = Boolean(error ?? ayuda);

  return (
    <div className={className}>
      <label htmlFor={idCampo} className="mb-1.5 block text-sm font-bold">
        {etiqueta}
      </label>
      <div className="relative">
        <input
          id={idCampo}
          aria-invalid={error ? true : undefined}
          aria-describedby={hayMensaje ? idMensaje : undefined}
          className={clsx(
            'min-h-12 w-full rounded-2xl border-2 bg-superficie-2 px-4 text-base text-tinta',
            adorno && 'pr-12',
            'placeholder:text-tinta-suave/70',
            error ? 'border-red-500' : 'border-borde focus:border-primario',
          )}
          {...resto}
        />
        {adorno && <div className="absolute inset-y-0 right-1 flex items-center">{adorno}</div>}
      </div>
      {hayMensaje && (
        <p
          id={idMensaje}
          role={error ? 'alert' : undefined}
          className={clsx(
            'mt-1.5 flex items-center gap-1.5 text-sm',
            error ? 'font-medium text-red-600 dark:text-red-400' : 'text-tinta-suave',
          )}
        >
          {error && <IconoAlerta className="shrink-0" />}
          {error ?? ayuda}
        </p>
      )}
    </div>
  );
}

