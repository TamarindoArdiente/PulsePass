import { useEffect, useId, useRef, type ReactNode } from 'react';
import { IconoCerrar } from './iconos';

interface PropsModal {
  abierto: boolean;
  onCerrar: () => void;
  titulo: string;
  children: ReactNode;
  /** Botones de acción (alineados a la derecha). */
  pie?: ReactNode;
}

/**
 * Diálogo modal con el elemento nativo <dialog>: el navegador ya atrapa el foco,
 * cierra con Esc y marca el resto de la página como inerte (accesibilidad gratis).
 */
export function Modal({ abierto, onCerrar, titulo, children, pie }: PropsModal) {
  const ref = useRef<HTMLDialogElement>(null);
  const idTitulo = useId();

  useEffect(() => {
    const dialogo = ref.current;
    if (dialogo === null) return;
    if (abierto && !dialogo.open) dialogo.showModal();
    if (!abierto && dialogo.open) dialogo.close();
  }, [abierto]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={idTitulo}
      onClose={onCerrar}
      onClick={(e) => {
        // Clic en el fondo oscuro (el propio <dialog>), no en su contenido.
        if (e.target === e.currentTarget) onCerrar();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl border border-borde bg-superficie p-0 text-tinta shadow-tarjeta backdrop:bg-black/60"
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 id={idTitulo} className="text-2xl">
            {titulo}
          </h2>
          <button type="button" onClick={onCerrar} aria-label="Cerrar" className="rounded-full p-1 text-xl text-tinta-suave hover:text-tinta">
            <IconoCerrar />
          </button>
        </div>
        <div className="mt-4">{children}</div>
        {pie && <div className="mt-6 flex flex-wrap justify-end gap-3">{pie}</div>}
      </div>
    </dialog>
  );
}
