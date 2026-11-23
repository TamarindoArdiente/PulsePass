import { createContext } from 'react';
import type { Rol } from '../types/dominio';
import type { Credenciales } from '../types/solicitudes';

export interface UsuarioSesion {
  id: number | null;
  username: string;
  email: string | null;
  roles: readonly Rol[];
  /** Rol de mayor jerarquía (ADMIN > STAFF > USER): define navegación y guardas. */
  rol: Rol;
}

/** Unión discriminada (FE-006): nunca varios booleanos que se contradicen. */
export type EstadoSesion =
  | { estado: 'cargando' }
  | { estado: 'anonimo' }
  | { estado: 'autenticado'; usuario: UsuarioSesion };

export interface ValorAuth {
  sesion: EstadoSesion;
  /** 'expirada' cuando el servidor rechazó el token (401): se muestra "Tu sesión expiró". */
  motivoSalida: 'expirada' | null;
  /** Lanza ApiError si las credenciales no son válidas. */
  iniciarSesion: (credenciales: Credenciales) => Promise<void>;
  cerrarSesion: () => void;
  limpiarMotivoSalida: () => void;
}

export const AuthContexto = createContext<ValorAuth | null>(null);
