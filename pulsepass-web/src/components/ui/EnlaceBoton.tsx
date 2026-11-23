import clsx from 'clsx';
import { Link, type LinkProps } from 'react-router';
import { CLASES_VARIANTE_BOTON, type VarianteBoton } from '../../lib/estilos';

interface PropsEnlaceBoton extends LinkProps {
  variante?: VarianteBoton;
  tamano?: 'normal' | 'pequeno';
}

export function EnlaceBoton({ variante = 'primario', tamano = 'normal', className, ...resto }: PropsEnlaceBoton) {
  return (
    <Link
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-full font-bold transition duration-150',
        tamano === 'normal' ? 'min-h-12 px-6 text-base' : 'min-h-10 px-4 text-sm',
        CLASES_VARIANTE_BOTON[variante],
        className,
      )}
      {...resto}
    />
  );
}
