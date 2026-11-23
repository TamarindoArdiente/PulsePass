import { useQuery } from '@tanstack/react-query';
import { obtenerUsuarioPorUsername } from '../api/usuarios';
import { CLAVES } from '../lib/claves';

/** Perfil completo de la persona con sesión (GET /api/users/by-username; permitido para el propio usuario). */
export function usePerfil(username: string | undefined) {
  return useQuery({
    queryKey: CLAVES.usuarios.porUsername(username ?? ''),
    queryFn: () => obtenerUsuarioPorUsername(username ?? ''),
    enabled: Boolean(username),
  });
}
