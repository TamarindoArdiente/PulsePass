import { esquemaTokenRespuesta, esquemaYo } from '../types/dominio';
import type { Credenciales } from '../types/solicitudes';
import { request } from './client';

/** POST /api/auth/login → token de acceso (15 min). */
export const iniciarSesionApi = (credenciales: Credenciales) =>
  request('/api/auth/login', {
    metodo: 'POST',
    cuerpo: credenciales,
    esquema: esquemaTokenRespuesta,
    sinToken: true,
  });

/** GET /api/auth/me → identidad y roles del token actual. */
export const obtenerYo = () => request('/api/auth/me', { esquema: esquemaYo });

