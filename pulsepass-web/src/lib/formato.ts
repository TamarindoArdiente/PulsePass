const formatoPrecio = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

const formatoFecha = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const formatoFechaHora = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

/** 250000 → "$ 250.000" */
export function formatearPrecioCOP(valor: number): string {
  return formatoPrecio.format(valor);
}

/** "2026-02-12T20:00:00" → "12 feb 2026" */
export function formatearFecha(iso: string): string {
  return formatoFecha.format(new Date(iso));
}

/** "2026-02-12T20:00:00" → "12 feb 2026, 08:00 p. m." */
export function formatearFechaHora(iso: string): string {
  return formatoFechaHora.format(new Date(iso));
}
