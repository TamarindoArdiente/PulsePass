import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { iniciarSesionApi, obtenerYo } from '../api/auth';
import { registrarAlSesionExpirada } from '../api/client';
import { CLAVES } from '../lib/claves';
import { rolPrincipal } from '../lib/roles';
import { borrarToken, guardarToken, leerToken } from '../lib/sesion';
import type { Yo } from '../types/dominio';
import type { Credenciales } from '../types/solicitudes';
import { AuthContexto, type EstadoSesion, type UsuarioSesion, type ValorAuth } from './authContexto';

function aUsuarioSesion(yo: Yo): UsuarioSesion {
  return {
    id: yo.id ?? null,
    username: yo.username,
    email: yo.email ?? null,
    roles: yo.roles,
    rol: rolPrincipal(yo.roles),
  };
}

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Sesión = token (sessionStorage) + identidad (GET /api/auth/me, en la caché de TanStack Query).
 * Debe ir DENTRO de <QueryClientProvider>.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(() => leerToken());
  const [motivoSalida, setMotivoSalida] = useState<'expirada' | null>(null);

  const cerrarSesion = useCallback(() => {
    borrarToken();
    setToken(null);
    queryClient.clear(); // FR-FE-AUTH-006: se elimina también la caché de consultas
  }, [queryClient]);

  // Un 401 con token = expiró: se cierra la sesión y se avisa (FR-FE-AUTH-005).
  useEffect(() => {
    registrarAlSesionExpirada(() => {
      cerrarSesion();
      setMotivoSalida('expirada');
    });
    return () => registrarAlSesionExpirada(null);
  }, [cerrarSesion]);

  const yo = useQuery({
    queryKey: CLAVES.auth.yo,
    queryFn: obtenerYo,
    enabled: token !== null,
    staleTime: Infinity,
  });

  const iniciarSesion = useCallback(
    async (credenciales: Credenciales) => {
      const respuesta = await iniciarSesionApi(credenciales);
      guardarToken(respuesta.accessToken);
      try {
        await queryClient.fetchQuery({ queryKey: CLAVES.auth.yo, queryFn: obtenerYo, staleTime: 0 });
      } catch (error: unknown) {
        borrarToken();
        throw error;
      }
      setToken(respuesta.accessToken);
      setMotivoSalida(null);
    },
    [queryClient],
  );

  const limpiarMotivoSalida = useCallback(() => setMotivoSalida(null), []);

  const sesion = useMemo<EstadoSesion>(() => {
    if (token === null) return { estado: 'anonimo' };
    if (yo.data) return { estado: 'autenticado', usuario: aUsuarioSesion(yo.data) };
    if (yo.isError) return { estado: 'anonimo' };
    return { estado: 'cargando' };
  }, [token, yo.data, yo.isError]);

  const valor = useMemo<ValorAuth>(
    () => ({ sesion, motivoSalida, iniciarSesion, cerrarSesion, limpiarMotivoSalida }),
    [sesion, motivoSalida, iniciarSesion, cerrarSesion, limpiarMotivoSalida],
  );

  return <AuthContexto value={valor}>{children}</AuthContexto>;
}
