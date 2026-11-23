import { useQuery } from '@tanstack/react-query';
import { obtenerSede, obtenerSedesActivas } from '../api/sedes';
import { CLAVES } from '../lib/claves';

export function useSedesActivas() {
  return useQuery({ queryKey: CLAVES.sedes.activas, queryFn: obtenerSedesActivas });
}

export function useSede(code: string | undefined) {
  return useQuery({
    queryKey: CLAVES.sedes.detalle(code ?? ''),
    queryFn: () => obtenerSede(code ?? ''),
    enabled: Boolean(code),
  });
}
