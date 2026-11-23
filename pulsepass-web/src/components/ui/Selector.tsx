import clsx from 'clsx';
import { useId, type ComponentProps } from 'react';

interface PropsSelector extends ComponentProps<'select'> {
  etiqueta: string;
}

export function Selector({ etiqueta, className, id, children, ...resto }: PropsSelector) {
  const idAuto = useId();
  const idCampo = id ?? idAuto;
  return (
    <div className={className}>
      <label htmlFor={idCampo} className="mb-1.5 block text-sm font-bold">
        {etiqueta}
      </label>
      <select
        id={idCampo}
        className={clsx('min-h-12 w-full rounded-2xl border-2 border-borde bg-superficie-2 px-3 text-base text-tinta focus:border-primario')}
        {...resto}
      >
        {children}
      </select>
    </div>
  );
}
