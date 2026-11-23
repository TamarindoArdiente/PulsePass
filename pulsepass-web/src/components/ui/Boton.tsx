import clsx from 'clsx';
import type { ComponentProps } from 'react';
import { CLASES_VARIANTE_BOTON, type VarianteBoton } from '../../lib/estilos';


interface PropsBoton extends ComponentProps<'button'> {
  variante?: VarianteBoton;
  cargando?: boolean;
}

export function Boton({
  variante = 'primario',
  cargando = false,
  disabled,
  className,
  children,
  type = 'button',
  ...resto
}: PropsBoton) {
  return (
    <button
      type={type}
      disabled={disabled || cargando}
      aria-busy={cargando || undefined}
      className={clsx(
        'inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-base font-bold',
        'transition duration-150 disabled:cursor-not-allowed disabled:opacity-55',
        CLASES_VARIANTE_BOTON[variante],
        className,
      )}
      {...resto}
    >
      {cargando ? 'Cargando…' : children}
    </button>
  );
}



