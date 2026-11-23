import { z } from 'zod';

/**
 * El token vive en sessionStorage: dura lo que dure la pestaña y sobrevive a recargas (FR-FE-AUTH-004).
 * Nunca va en la URL ni se imprime en consola (FE-013).
 */
const CLAVE_TOKEN = 'pulsepass:token';
const esquemaToken = z.string().min(1);

export function leerToken(): string | null {
  try {
    const crudo = sessionStorage.getItem(CLAVE_TOKEN);
    const r = esquemaToken.safeParse(crudo);
    return r.success ? r.data : null;
  } catch {
    return null;
  }
}

export function guardarToken(token: string): void {
  try {
    sessionStorage.setItem(CLAVE_TOKEN, token);
  } catch {
    // Almacenamiento bloqueado: la sesión dura solo mientras no se recargue la página.
  }
}

export function borrarToken(): void {
  try {
    sessionStorage.removeItem(CLAVE_TOKEN);
  } catch {
    // Nada que hacer.
  }
}
