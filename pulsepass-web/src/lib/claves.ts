/**
 * Claves de caché de TanStack Query, centralizadas. Comparten prefijos para poder
 * invalidar por grupos: invalidar ['eventos'] refresca cartelera, detalles y pagados.
 */
export const CLAVES = {
  auth: { yo: ['auth', 'yo'] as const },
  eventos: {
    todos: ['eventos'] as const,
    publicados: ['eventos', 'publicados'] as const,
    detalle: (eventCode: string) => ['eventos', 'detalle', eventCode] as const,
    porArtista: (stageName: string) => ['eventos', 'por-artista', stageName] as const,
    pagados: (eventCode: string) => ['eventos', 'pagados', eventCode] as const,
  },
  artistas: {
    activos: ['artistas', 'activos'] as const,
    detalle: (id: string) => ['artistas', 'detalle', id] as const,
    porNombre: (stageName: string) => ['artistas', 'por-nombre', stageName] as const,
  },
  sedes: {
    activas: ['sedes', 'activas'] as const,
    detalle: (code: string) => ['sedes', 'detalle', code] as const,
  },
  tickets: {
    todos: ['tickets'] as const,
    porUsuario: (email: string) => ['tickets', 'por-usuario', email] as const,
    detalle: (ticketCode: string) => ['tickets', 'detalle', ticketCode] as const,
  },
  usuarios: {
    porUsername: (username: string) => ['usuarios', 'por-username', username] as const,
    porEmail: (email: string) => ['usuarios', 'por-email', email] as const,
  },
} as const;
