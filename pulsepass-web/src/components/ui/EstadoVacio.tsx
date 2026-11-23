import type { ReactNode } from 'react';

interface PropsEstadoVacio {
  icono?: ReactNode;
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
}

/** Pantalla sin datos: ícono, mensaje y una acción sugerida (PRD §9.20). */
export function EstadoVacio({ icono, titulo, descripcion, accion }: PropsEstadoVacio) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-borde px-6 py-14 text-center">
      {icono && <div className="text-4xl text-tinta-suave">{icono}</div>}
      <h2 className="text-xl">{titulo}</h2>
      {descripcion && <p className="max-w-md text-tinta-suave">{descripcion}</p>}
      {accion}
    </div>
  );
}
