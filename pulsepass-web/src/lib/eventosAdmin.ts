import { z } from 'zod';

/**
 * La API no ofrece "listar todos los eventos" (GAP-01): un borrador solo se puede pedir por su código.
 * Por eso el panel de administración recuerda en este navegador los códigos que la persona creó o abrió.
 * Es una comodidad por navegador, no una fuente de verdad: el servidor sigue siendo quien manda.
 */
const CLAVE = 'pulsepass:admin-eventos';
const MAXIMO = 50;
const esquemaCodigos = z.array(z.string().min(1));

export function leerCodigosAdmin(): string[] {
  try {
    const crudo = localStorage.getItem(CLAVE);
    if (crudo === null) return [];
    const r = esquemaCodigos.safeParse(JSON.parse(crudo));
    return r.success ? r.data : [];
  } catch {
    return [];
  }
}

/** Agrega el código al principio (sin duplicados) y devuelve la lista resultante. */
export function recordarCodigoAdmin(codigo: string): string[] {
  const limpio = codigo.trim();
  const actuales = leerCodigosAdmin();
  if (limpio === '') return actuales;
  const nuevos = [limpio, ...actuales.filter((c) => c !== limpio)].slice(0, MAXIMO);
  try {
    localStorage.setItem(CLAVE, JSON.stringify(nuevos));
  } catch {
    // Almacenamiento bloqueado: la lista dura solo mientras la página siga abierta.
  }
  return nuevos;
}

export function olvidarCodigoAdmin(codigo: string): string[] {
  const nuevos = leerCodigosAdmin().filter((c) => c !== codigo);
  try {
    localStorage.setItem(CLAVE, JSON.stringify(nuevos));
  } catch {
    // Nada que hacer.
  }
  return nuevos;
}
