import clsx from 'clsx';
import { useId, type ComponentProps } from 'react';
import { IconoAlerta } from './iconos';

interface PropsAreaTexto extends ComponentProps<'textarea'> {
  etiqueta: string;
  error?: string;
  ayuda?: string;
}

export function AreaTexto({ etiqueta, error, ayuda, className, id, ...resto }: PropsAreaTexto) {
  const idAuto = useId();
  const idCampo = id ?? idAuto;
  const idMensaje = `${idCampo}-mensaje`;
  const hayMensaje = Boolean(error ?? ayuda);

  return (
    <div className={className}>
      <label htmlFor={idCampo} className="mb-1.5 block text-sm font-bold">
        {etiqueta}
      </label>
      <textarea
        id={idCampo}
        rows={4}
        aria-invalid={error ? true : undefined}
        aria-describedby={hayMensaje ? idMensaje : undefined}
        className={clsx(
          'w-full rounded-2xl border-2 bg-superficie-2 px-4 py-3 text-base text-tinta',
          error ? 'border-red-500' : 'border-borde focus:border-primario',
        )}
        {...resto}
      />
      {hayMensaje && (
        <p
          id={idMensaje}
          role={error ? 'alert' : undefined}
          className={clsx('mt-1.5 flex items-center gap-1.5 text-sm', error ? 'font-medium text-red-600 dark:text-red-400' : 'text-tinta-suave')}
        >
          {error && <IconoAlerta className="shrink-0" />}
          {error ?? ayuda}
        </p>
      )}
    </div>
  );
}
