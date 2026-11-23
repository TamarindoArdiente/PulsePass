import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  asociarArtista,
  crearEvento,
  obtenerEvento,
  obtenerEventosPorArtista,
  obtenerEventosPublicados,
  publicarEvento,
} from '../api/eventos';
import { CLAVES } from '../lib/claves';

export function useEventosPublicados() {
  return useQuery({ queryKey: CLAVES.eventos.publicados, queryFn: obtenerEventosPublicados });
}

export function useEvento(eventCode: string | undefined) {
  return useQuery({
    queryKey: CLAVES.eventos.detalle(eventCode ?? ''),
    queryFn: () => obtenerEvento(eventCode ?? ''),
    enabled: Boolean(eventCode),
  });
}

/** Solo consulta cuando hay un artista elegido (?artista=). */
export function useEventosPorArtista(stageName: string | null | undefined) {
  return useQuery({
    queryKey: CLAVES.eventos.porArtista(stageName ?? ''),
    queryFn: () => obtenerEventosPorArtista(stageName ?? ''),
    enabled: Boolean(stageName),
  });
}

export function useCrearEvento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crearEvento,
    onSuccess: (evento) => {
      queryClient.setQueryData(CLAVES.eventos.detalle(evento.eventCode), evento);
    },
  });
}

export function usePublicarEvento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: publicarEvento,
    // Publicar cambia la cartelera y el detalle: se invalida todo el grupo ['eventos'].
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CLAVES.eventos.todos }),
  });
}

export function useAsociarArtista(eventCode: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (artistId: number) => asociarArtista(eventCode, artistId),
    onSuccess: (evento) => {
      queryClient.setQueryData(CLAVES.eventos.detalle(eventCode), evento);
    },
  });
}
