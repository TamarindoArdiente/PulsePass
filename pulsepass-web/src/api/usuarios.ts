import { esquemaPerfilUsuario } from '../types/dominio';
import type { SolicitudRegistro } from '../types/solicitudes';
import { construirRuta, request } from './client';

/** POST /api/users → 201. El registro NO inicia sesión (GAP-07): luego se va a /login. */
export const registrarUsuario = (datos: SolicitudRegistro) =>
  request('/api/users', { metodo: 'POST', cuerpo: datos, esquema: esquemaPerfilUsuario, sinToken: true });

/** GET /api/users/by-email?email= (solo el propio usuario o ADMIN) */
export const obtenerUsuarioPorEmail = (email: string) =>
  request(construirRuta('/api/users/by-email', { email }), { esquema: esquemaPerfilUsuario });

/** GET /api/users/by-username?username= (solo el propio usuario o ADMIN) */
export const obtenerUsuarioPorUsername = (username: string) =>
  request(construirRuta('/api/users/by-username', { username }), { esquema: esquemaPerfilUsuario });
