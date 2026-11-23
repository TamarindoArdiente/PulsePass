import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { AuthProvider } from '../context/AuthProvider';
import { TemaProvider } from '../context/TemaProvider';
import { rutas } from '../rutas';
import type { Rol } from '../types/dominio';
import { API, yo } from './datos';
import { servidor } from './servidor';

interface Opciones {
  /** Si se indica, la prueba arranca con sesión iniciada con ese rol. */
  rol?: Rol;
}

/** Monta la app completa (providers + rutas reales) en un router en memoria. */
export function renderizarApp(ruta: string, { rol }: Opciones = {}) {
  if (rol !== undefined) {
    sessionStorage.setItem('pulsepass:token', 'token-de-prueba');
    servidor.use(http.get(`${API}/auth/me`, () => HttpResponse.json(yo(rol))));
  }

  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const router = createMemoryRouter(rutas, { initialEntries: [ruta] });

  render(
    <QueryClientProvider client={queryClient}>
      <TemaProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </TemaProvider>
    </QueryClientProvider>,
  );
  return { router, queryClient };
}

/** Respuesta de error con el formato del backend. */
export function errorApi(status: number, message: string, details?: Record<string, string>) {
  return HttpResponse.json({ status, message, error: 'Error', details }, { status });
}
