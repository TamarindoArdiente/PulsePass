import clsx from 'clsx';
import { useTema } from '../../hooks/useTema';
import type { Modo } from '../../types/dominio';


interface Opcion {
  modo: Modo;
  etiqueta: string;
  Icono: string;
}

const OPCIONES: readonly Opcion[] = [
  { modo: 'claro', etiqueta: 'Modo claro', Icono: '/sol.svg' },
  { modo: 'oscuro', etiqueta: 'Modo oscuro', Icono: '/luna.svg' },
];

export function InterruptorTema() {
  const { modo, elegir } = useTema();

  return (
    <div
      role="group"
      aria-label="Modo de color"
      className="relative inline-grid grid-cols-2 rounded-full border border-borde bg-superficie-2 p-1"
    >
      
      <span
        aria-hidden="true"
        className={clsx(
          'absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-primario shadow-md',
          'transition-transform duration-300 ease-out motion-reduce:transition-none',
          modo === 'oscuro' ? 'translate-x-full' : 'translate-x-0',
        )}
      />
      {OPCIONES.map(({ modo: valor, etiqueta,Icono }) => {
        const activa = modo === valor;
        return (
          <button
            key={valor}
            type="button"
            aria-pressed={activa}
            aria-label= {etiqueta}
            title={etiqueta}
            onClick={() => elegir(valor)}
            className="relative z-10 flex min-h-11 min-w-11 items-center justify-center rounded-full px-3 transition-opacity duration-300 sm:px-4"
          >
            <img
              src={Icono}
              alt=""
              aria-hidden="true"
              className={clsx('h-10 w-10', activa ? 'opacity-100' : 'opacity-60 hover:opacity-100')}
            />
          </button>
        );
      })}
    </div>
  );
}
