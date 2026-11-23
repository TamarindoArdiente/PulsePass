import { esApiError } from '../api/client';

/**
 * El backend responde sus reglas de negocio en inglés. Se traducen las conocidas para que la interfaz
 * hable un solo idioma; si llega un mensaje nuevo que no está aquí, se muestra tal cual (nunca se pierde).
 * La decisión de la regla sigue siendo del servidor: aquí solo cambia el texto (FE-001).
 */
const TRADUCCIONES: readonly (readonly [RegExp, string])[] = [
  [/^Event already exists:/, 'Ya existe un evento con ese código.'],
  [/^Cannot create an event in an inactive venue/, 'No se puede crear un evento en una sede inactiva.'],
  [/^Event date must be in the future/, 'La fecha del evento debe ser futura.'],
  [/^Minimum age must be greater than or equal to 0/, 'La edad mínima no puede ser negativa.'],
  [/^Cannot publish an event whose date is no longer in the future/, 'No se puede publicar: la fecha del evento ya pasó.'],
  [/^Cannot publish an event whose venue is no longer active/, 'No se puede publicar: la sede ya no está activa.'],
  [/^Inactive user cannot purchase tickets/, 'Tu cuenta está inactiva y no puede comprar entradas.'],
  [/^Cannot purchase a ticket for an event that has already occurred/, 'No se pueden comprar entradas de un evento que ya ocurrió.'],
  [/^Event has no remaining capacity/, 'Ya no quedan entradas disponibles para este evento.'],
  [/^User does not meet minimum age for event/, 'No cumples la edad mínima para este evento.'],
  [/^Cannot cancel a ticket after the event date/, 'No se puede cancelar un ticket después de la fecha del evento.'],
  [/^Username already exists/, 'Ese nombre de usuario ya está registrado.'],
  [/^Email already exists/, 'Ese correo ya está registrado.'],
  [/^Birth date cannot be in the future/, 'La fecha de nacimiento no puede ser futura.'],
];

export function traducirMensaje(mensaje: string): string {
  return TRADUCCIONES.find(([patron]) => patron.test(mensaje))?.[1] ?? mensaje;
}

/**
 * Traduce cualquier error a un mensaje para la persona usuaria (PRD §2.3).
 * Un 409 es una regla de negocio del backend (edad mínima, capacidad, estado…):
 * se muestra tal cual la devuelve, porque la UI no reimplementa reglas (FE-001).
 */
export function mensajeDeError(error: unknown): string {
  if (!esApiError(error)) return 'Ocurrió un error inesperado. Inténtalo de nuevo.';

  switch (error.status) {
    case 0:
      return error.message;
    case 400:
      return 'Revisa los datos: hay campos que no son válidos.';
    case 401:
      return 'Tu sesión expiró. Inicia sesión de nuevo.';
    case 403:
      return 'No tienes permisos para hacer esto.';
    case 404:
      return 'No encontramos lo que buscas.';
    case 409:
      return traducirMensaje(error.message);
    default:
      return error.status >= 500
        ? 'El servidor tuvo un problema. Inténtalo en unos minutos.'
        : error.message;
  }
}

/** Errores por campo del backend (400), listos para marcar en el formulario. */
export function erroresPorCampo(error: unknown): Record<string, string> {
  return esApiError(error) ? { ...error.detalles } : {};
}
