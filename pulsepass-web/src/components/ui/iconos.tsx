import type { SVGProps } from 'react';

/** Iconos SVG de trazo (DES-01). Decorativos: aria-hidden por defecto. */
type PropsIcono = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: PropsIcono) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconoNota(props: PropsIcono) {
  return (
    <Base {...props}>
      <path d="M9 18V6l10-2v12" />
      <circle cx="6.5" cy="18" r="2.5" />
      <circle cx="16.5" cy="16" r="2.5" />
    </Base>
  );
}

export function IconoAlerta(props: PropsIcono) {
  return (
    <Base {...props}>
      <path d="M12 3.5 2.8 19.5h18.4L12 3.5Z" />
      <path d="M12 10v4.2M12 17.2v.1" />
    </Base>
  );
}

export function IconoMenu(props: PropsIcono) {
  return (
    <Base {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Base>
  );
}

export function IconoCerrar(props: PropsIcono) {
  return (
    <Base {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Base>
  );
}

export function IconoBuscar(props: PropsIcono) {
  return (
    <Base {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-4-4" />
    </Base>
  );
}

export function IconoCalendario(props: PropsIcono) {
  return (
    <Base {...props}>
      <rect x="4" y="5" width="16" height="15" rx="3" />
      <path d="M8 3v4M16 3v4M4 10h16" />
    </Base>
  );
}

export function IconoUbicacion(props: PropsIcono) {
  return (
    <Base {...props}>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.3" />
    </Base>
  );
}

export function IconoTicket(props: PropsIcono) {
  return (
    <Base {...props}>
      <path d="M4 6h16a1 1 0 0 1 1 1v3a2 2 0 0 0 0 4v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a2 2 0 0 0 0-4V7a1 1 0 0 1 1-1Z" />
      <path d="M14.5 7v10" strokeDasharray="2 2.4" />
    </Base>
  );
}

export function IconoUsuario(props: PropsIcono) {
  return (
    <Base {...props}>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
    </Base>
  );
}

export function IconoFlechaIzquierda(props: PropsIcono) {
  return (
    <Base {...props}>
      <path d="M15 5l-7 7 7 7" />
    </Base>
  );
}

export function IconoFlechaDerecha(props: PropsIcono) {
  return (
    <Base {...props}>
      <path d="M9 5l7 7-7 7" />
    </Base>
  );
}

export function IconoChevronAbajo(props: PropsIcono) {
  return (
    <Base {...props}>
      <path d="M6 9l6 6 6-6" />
    </Base>
  );
}

export function IconoOjo(props: PropsIcono) {
  return (
    <Base {...props}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </Base>
  );
}

export function IconoOjoCerrado(props: PropsIcono) {
  return (
    <Base {...props}>
      <path d="M2.5 12S6 5.5 12 5.5c1.7 0 3.2.5 4.5 1.2M21.5 12S18 18.5 12 18.5c-1.7 0-3.2-.5-4.5-1.2" />
      <path d="M4 4l16 16" />
    </Base>
  );
}

export function IconoCheck(props: PropsIcono) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l3 3 5-6" />
    </Base>
  );
}

export function IconoInfo(props: PropsIcono) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8v.1" />
    </Base>
  );
}

export function IconoReintentar(props: PropsIcono) {
  return (
    <Base {...props}>
      <path d="M20 12a8 8 0 1 1-2.3-5.7" />
      <path d="M20 4v4h-4" />
    </Base>
  );
}

export function IconoDeporte(props: PropsIcono) {
  return (
    <Base {...props}>
      <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
      <path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M9 20h6" />
    </Base>
  );
}

export function IconoTecnologia(props: PropsIcono) {
  return (
    <Base {...props}>
      <rect x="7" y="7" width="10" height="10" rx="2" />
      <path d="M10 3v3M14 3v3M10 18v3M14 18v3M3 10h3M3 14h3M18 10h3M18 14h3" />
    </Base>
  );
}

export function IconoEducacion(props: PropsIcono) {
  return (
    <Base {...props}>
      <path d="M2.5 9L12 4.5 21.5 9 12 13.5 2.5 9Z" />
      <path d="M6.5 11.2V16c0 1.3 2.5 2.5 5.5 2.5s5.5-1.2 5.5-2.5v-4.8M21.5 9v5" />
    </Base>
  );
}

export function IconoCultura(props: PropsIcono) {
  return (
    <Base {...props}>
      <path d="M12 3a9 9 0 1 0 0 18c1.4 0 2-1 1.5-2.1-.5-1.1.2-2.4 1.5-2.4H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3Z" />
      <circle cx="7.5" cy="11" r="0.9" fill="currentColor" />
      <circle cx="10" cy="7" r="0.9" fill="currentColor" />
      <circle cx="14.5" cy="7" r="0.9" fill="currentColor" />
    </Base>
  );
}

export function IconoEntretenimiento(props: PropsIcono) {
  return (
    <Base {...props}>
      <path d="M12 3l2.4 5.6 6 .6-4.5 4 1.4 5.9L12 16.1 6.7 19.1l1.4-5.9-4.5-4 6-.6L12 3Z" />
    </Base>
  );
}
