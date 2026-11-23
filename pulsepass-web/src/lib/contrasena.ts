export type Fortaleza = 'debil' | 'media' | 'fuerte';

/** Indicador orientativo para la persona usuaria; la regla real (mín. 12) la valida zod y el backend. */
export function fortalezaContrasena(valor: string): { nivel: Fortaleza; puntos: number } {
  let puntos = 0;
  if (valor.length >= 12) puntos++;
  if (valor.length >= 16) puntos++;
  if (/[a-z]/.test(valor) && /[A-Z]/.test(valor)) puntos++;
  if (/\d/.test(valor)) puntos++;
  if (/[^A-Za-z0-9]/.test(valor)) puntos++;
  return { nivel: puntos <= 2 ? 'debil' : puntos <= 3 ? 'media' : 'fuerte', puntos };
}
