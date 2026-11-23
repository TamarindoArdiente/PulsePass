import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cancelarTicket,
  comprarTicket,
  marcarTicketUsado,
  obtenerTicket,
  obtenerTicketsDeUsuario,
  obtenerTicketsPagados,
} from '../api/tickets';
import { CLAVES } from '../lib/claves';
import type { SolicitudCompra } from '../types/solicitudes';
import { useAuth } from './useAuth';

function useEmailDeSesion(): string | null {
  const { sesion } = useAuth();
  return sesion.estado === 'autenticado' ? sesion.usuario.email : null;
}

/** "Mis tickets": GET /api/tickets/by-user con el email de la sesión (GAP-03). */
export function useMisTickets() {
  const email = useEmailDeSesion();
  return useQuery({
    queryKey: CLAVES.tickets.porUsuario(email ?? ''),
    queryFn: () => obtenerTicketsDeUsuario(email ?? ''),
    enabled: email !== null,
  });
}

export function useTicket(ticketCode: string | undefined) {
  return useQuery({
    queryKey: CLAVES.tickets.detalle(ticketCode ?? ''),
    queryFn: () => obtenerTicket(ticketCode ?? ''),
    enabled: Boolean(ticketCode),
  });
}

/** Compra con el email de la sesión; la UI no calcula ni envía precios. */
export function useComprarTicket() {
  const queryClient = useQueryClient();
  const email = useEmailDeSesion();
  return useMutation({
    mutationFn: (solicitud: SolicitudCompra) => {
      if (email === null) throw new Error('No hay una sesión activa para comprar.');
      return comprarTicket({ userEmail: email, ...solicitud });
    },
    onSuccess: (ticket) => {
      queryClient.setQueryData(CLAVES.tickets.detalle(ticket.ticketCode), ticket);
      void queryClient.invalidateQueries({ queryKey: CLAVES.tickets.todos });
    },
  });
}

export function useCancelarTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelarTicket,
    onSuccess: (ticket) => {
      queryClient.setQueryData(CLAVES.tickets.detalle(ticket.ticketCode), ticket);
      void queryClient.invalidateQueries({ queryKey: CLAVES.tickets.todos });
    },
  });
}

export function useMarcarTicketUsado() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: marcarTicketUsado,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CLAVES.tickets.todos });
      void queryClient.invalidateQueries({ queryKey: CLAVES.eventos.todos }); // tabla de pagados
    },
  });
}

export function useTicketsPagados(eventCode: string | undefined) {
  return useQuery({
    queryKey: CLAVES.eventos.pagados(eventCode ?? ''),
    queryFn: () => obtenerTicketsPagados(eventCode ?? ''),
    enabled: Boolean(eventCode),
  });
}
