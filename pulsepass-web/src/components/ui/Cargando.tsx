import clsx from 'clsx';

/** Bloque gris pulsante con la forma del contenido que viene (PRD §9.20). */
export function Esqueleto({ className }: { className?: string }) {
  return <div aria-hidden="true" className={clsx('animate-pulse rounded-2xl bg-superficie-2', className)} />;
}

/** Zona que está cargando: los lectores de pantalla reciben aria-busy y un texto. */
export function Cargando({ texto = 'Cargando…', className }: { texto?: string; className?: string }) {
  return (
    <div role="status" aria-busy="true" className={clsx('flex flex-col items-center gap-3 py-16 text-tinta-suave', className)}>
      <span className="size-9 animate-spin rounded-full border-4 border-borde border-t-primario motion-reduce:animate-none" />
      <span className="text-sm font-medium">{texto}</span>
    </div>
  );
}

export function GrillaEsqueletos({ cantidad = 3 }: { cantidad?: number }) {
  return (
    <div aria-busy="true" aria-label="Cargando eventos" role="status" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: cantidad }, (_, i) => (
        <Esqueleto key={i} className="h-72" />
      ))}
    </div>
  );
}
