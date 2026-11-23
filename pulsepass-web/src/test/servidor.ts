import { setupServer } from 'msw/node';

/** Servidor falso compartido: cada prueba registra sus respuestas con `servidor.use(...)`. */
export const servidor = setupServer();
