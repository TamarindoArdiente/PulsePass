import type { ZodType } from 'zod';
import { leerToken } from '../lib/sesion';
import { esquemaErrorApi } from '../types/dominio';

/**
 * Cliente HTTP único. Responsabilidades (y solo estas):
 *  - enviar el token como `Authorization: Bearer` (nunca en la URL, FE-013);
 *  - traducir el ErrorResponse del backend y los fallos de red a un `ApiError` tipado;
 *  - validar con zod lo que devuelve el servidor (FE-002);
 *  - avisar a la sesión cuando un token vencido recibe 401.
 */

export class ApiError extends Error {
  /** Código HTTP. 0 = no hubo respuesta (red caída o servidor apagado). */
  readonly status: number;
  /** Errores por campo (`details` del backend), p. ej. { password: '...' }. */
  readonly detalles: Readonly<Record<string, string>>;

  constructor(init: { status: number; message: string; detalles?: Record<string, string> | null }) {
    super(init.message);
    this.name = 'ApiError';
    this.status = init.status;
    this.detalles = init.detalles ?? {};
  }
}

export function esApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

let alSesionExpirada: (() => void) | null = null;

/** La registra el AuthProvider. Se llama cuando un token enviado recibe 401. */
export function registrarAlSesionExpirada(manejador: (() => void) | null): void {
  alSesionExpirada = manejador;
}

type Metodo = 'GET' | 'POST' | 'PATCH';

interface OpcionesRequest<T> {
  metodo?: Metodo;
  cuerpo?: unknown;
  esquema: ZodType<T>;
  /** Login y registro son públicos: no se envía el token (un token viejo podría estorbar). */
  sinToken?: boolean;
}

/** Arma `/api/...?clave=valor` codificando los parámetros (nada de concatenar a mano). */
export function construirRuta(ruta: string, consulta?: Record<string, string>): string {
  if (!consulta) return ruta;
  return `${ruta}?${new URLSearchParams(consulta).toString()}`;
}

export async function request<T>(ruta: string, opciones: OpcionesRequest<T>): Promise<T> {
  const { metodo = 'GET', cuerpo, esquema, sinToken = false } = opciones;
  const token = sinToken ? null : leerToken();

  const encabezados: Record<string, string> = { Accept: 'application/json' };
  if (cuerpo !== undefined) encabezados['Content-Type'] = 'application/json';
  if (token !== null) encabezados.Authorization = `Bearer ${token}`;

  let respuesta: Response;
  try {
    respuesta = await fetch(ruta, {
      method: metodo,
      headers: encabezados,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    });
  } catch {
    throw new ApiError({
      status: 0,
      message: 'No pudimos conectarnos con el servidor. Revisa tu conexión e inténtalo de nuevo.',
    });
  }

  if (!respuesta.ok) {
    const crudo: unknown = await respuesta.json().catch(() => null);
    const error = esquemaErrorApi.safeParse(crudo);

    // Un 401 con token = la sesión venció. Sin token (p. ej. login fallido) no es expiración.
    if (respuesta.status === 401 && token !== null) alSesionExpirada?.();

    // Un 5xx SIN el cuerpo de error del backend no lo produjo Spring: lo devuelve el proxy de Vite
    // (o un gateway) cuando no logra comunicarse con el backend. Se trata como "sin conexión".
    if (!error.success && respuesta.status >= 500) {
      throw new ApiError({
        status: 0,
        message: 'No pudimos comunicarnos con el servidor. Revisa que el backend esté encendido e inténtalo de nuevo.',
      });
    }

    throw new ApiError({
      status: error.success ? error.data.status : respuesta.status,
      message: error.success ? error.data.message : 'No pudimos completar la operación.',
      detalles: error.success ? error.data.details : null,
    });
  }

  const datos: unknown = await respuesta.json().catch(() => null);
  const validado = esquema.safeParse(datos);
  if (!validado.success) {
    throw new ApiError({
      status: 500,
      message: 'El servidor respondió con un formato inesperado.',
    });
  }
  return validado.data;
}
