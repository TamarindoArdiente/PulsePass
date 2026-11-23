import { useMutation } from '@tanstack/react-query';
import { registrarUsuario } from '../api/usuarios';

/** El registro no devuelve token (GAP-07): al terminar se redirige a /login. */
export function useRegistro() {
  return useMutation({ mutationFn: registrarUsuario });
}
