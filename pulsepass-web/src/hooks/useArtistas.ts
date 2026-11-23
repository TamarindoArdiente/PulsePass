import { useQuery } from '@tanstack/react-query';
import { obtenerArtista, obtenerArtistaPorNombre, obtenerArtistasActivos } from '../api/artistas';
import { CLAVES } from '../lib/claves';

export function useArtistasActivos() {
  return useQuery({ queryKey: CLAVES.artistas.activos, queryFn: obtenerArtistasActivos });
}

export function useArtista(id: string | undefined) {
  return useQuery({
    queryKey: CLAVES.artistas.detalle(id ?? ''),
    queryFn: () => obtenerArtista(id ?? ''),
    enabled: Boolean(id),
  });
}

export function useArtistaPorNombre(stageName: string | null | undefined) {
  return useQuery({
    queryKey: CLAVES.artistas.porNombre(stageName ?? ''),
    queryFn: () => obtenerArtistaPorNombre(stageName ?? ''),
    enabled: Boolean(stageName),
  });
}
