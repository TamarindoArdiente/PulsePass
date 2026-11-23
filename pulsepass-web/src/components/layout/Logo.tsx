import clsx from 'clsx';

/**
 * Marca de PulsePass: un ticket con una línea de pulso (de ahí el nombre).
 * Usa los colores del tema, así cambia sola entre Coachella (claro) y Disco (oscuro).
 */
export function Logo({ className, soloSimbolo = false }: { className?: string; soloSimbolo?: boolean }) {
  return (
    <span className={clsx('inline-flex items-center gap-2.5', className)}>
      <svg viewBox="0 0 40 40" className="size-10 shrink-0" aria-hidden="true">
        <defs>
          <linearGradient id="logo-degradado" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" style={{ stopColor: 'var(--primario)' }} />
            <stop offset="1" style={{ stopColor: 'var(--acento)' }} />
          </linearGradient>
        </defs>
        <path
          d="M6 8h28a2 2 0 0 1 2 2v5.5a4.5 4.5 0 0 0 0 9V30a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5.5a4.5 4.5 0 0 0 0-9V10a2 2 0 0 1 2-2Z"
          fill="url(#logo-degradado)"
        />
        <path
          d="M8 20.5h6l2.6-7.5 4.4 14 3-9.5 1.6 3H32"
          fill="none"
          stroke="var(--tinta-sobre-primario)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {!soloSimbolo && <span className="font-titulo text-xl font-extrabold tracking-tight">PulsePass</span>}
    </span>
  );
}
