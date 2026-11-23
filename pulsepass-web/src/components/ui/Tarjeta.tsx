import clsx from 'clsx';
import type { ReactNode } from 'react';

interface PropsTarjeta {
  children: ReactNode;
  className?: string;
}

export function Tarjeta({ children, className }: PropsTarjeta) {
  return (
    <div
      className={clsx(
        'rounded-3xl border border-borde bg-superficie p-5 shadow-tarjeta sm:p-6',
        className,
      )}
    >
      {children}
    </div>
  );
}

