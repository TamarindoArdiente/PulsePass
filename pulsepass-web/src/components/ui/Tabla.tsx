import clsx from 'clsx';
import type { ReactNode } from 'react';

export interface Columna<T> {
  /** Identifica la columna (key de React). */
  clave: string;
  encabezado: string;
  celda: (fila: T) => ReactNode;
  alinear?: 'izquierda' | 'derecha';
  /** Si la columna solo contiene un botón, el encabezado se oculta visualmente pero se conserva para lectores. */
  encabezadoOculto?: boolean;
}

interface PropsTabla<T> {
  columnas: readonly Columna<T>[];
  filas: readonly T[];
  claveFila: (fila: T) => string | number;
  /** Describe la tabla a los lectores de pantalla (y se muestra como título si `visibleCaption`). */
  descripcion: string;
}

/**
 * Tabla genérica y accesible: <caption>, <th scope>, y desplazamiento horizontal en pantallas
 * pequeñas (la región con scroll es enfocable para poder moverse con el teclado).
 */
export function Tabla<T>({ columnas, filas, claveFila, descripcion }: PropsTabla<T>) {
  return (
    <div
      role="region"
      aria-label={descripcion}
      tabIndex={0}
      className="overflow-x-auto rounded-3xl border border-borde bg-superficie shadow-tarjeta"
    >
      <table className="w-full min-w-160 border-collapse text-left">
        <caption className="sr-only">{descripcion}</caption>
        <thead className="bg-superficie-2">
          <tr>
            {columnas.map((c) => (
              <th
                key={c.clave}
                scope="col"
                className={clsx('px-4 py-3 text-sm font-bold', c.alinear === 'derecha' && 'text-right')}
              >
                <span className={c.encabezadoOculto ? 'sr-only' : undefined}>{c.encabezado}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila) => (
            <tr key={claveFila(fila)} className="border-t border-borde">
              {columnas.map((c) => (
                <td key={c.clave} className={clsx('px-4 py-3 align-middle', c.alinear === 'derecha' && 'text-right')}>
                  {c.celda(fila)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
