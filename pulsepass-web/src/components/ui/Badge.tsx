import clsx from 'clsx';
import { CLASES_BADGE, ETIQUETA_BADGE } from '../../lib/estilos';
import type { TonoBadge } from '../../types/dominio';

interface PropsBadge {
  tono: TonoBadge;
  className?: string;
}

export function Badge({ tono, className }: PropsBadge) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold',
        CLASES_BADGE[tono],
        className,
      )}
    >
      {ETIQUETA_BADGE[tono]}
    </span>
  );
}
