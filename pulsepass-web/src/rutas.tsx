import type { ComponentType } from 'react';
import type { RouteObject } from 'react-router';
import Layout from './layouts/Layout';
import RutaPorRol from './layouts/RutaPorRol';
import RutaProtegida from './layouts/RutaProtegida';
import SoloAnonimo from './layouts/SoloAnonimo';
import { PATRONES } from './lib/rutas';
import ErrorPagina from './pages/ErrorPagina';
import Inicio from './pages/Inicio';

/** Carga perezosa por ruta: cada página es su propio bundle (el Inicio va eager para el primer render). */
const perezosa = (cargar: () => Promise<{ default: ComponentType }>) => ({
  lazy: async () => ({ Component: (await cargar()).default }),
});

/** Las rutas se exportan aparte del router para poder probarlas con un router en memoria. */
export const rutas: RouteObject[] = [
  {
    element: <Layout />,
    errorElement: <ErrorPagina />,
    children: [
      { index: true, element: <Inicio /> },
      { path: PATRONES.eventos, ...perezosa(() => import('./pages/CatalogoEventos')) },
      { path: PATRONES.evento, ...perezosa(() => import('./pages/DetalleEvento')) },
      { path: PATRONES.artistas, ...perezosa(() => import('./pages/Artistas')) },
      { path: PATRONES.artista, ...perezosa(() => import('./pages/DetalleArtista')) },
      { path: PATRONES.sedes, ...perezosa(() => import('./pages/Sedes')) },
      { path: PATRONES.sede, ...perezosa(() => import('./pages/DetalleSede')) },

      {
        element: <SoloAnonimo />,
        children: [
          { path: PATRONES.login, ...perezosa(() => import('./pages/Login')) },
          { path: PATRONES.registro, ...perezosa(() => import('./pages/Registro')) },
        ],
      },

      {
        element: <RutaProtegida />,
        children: [
          { path: PATRONES.cuenta, ...perezosa(() => import('./pages/Cuenta')) },
          {
            element: <RutaPorRol roles={['USER']} />,
            children: [
              { path: PATRONES.misTickets, ...perezosa(() => import('./pages/MisTickets')) },
              { path: PATRONES.ticket, ...perezosa(() => import('./pages/DetalleTicket')) },
              { path: PATRONES.confirmacion, ...perezosa(() => import('./pages/ConfirmacionCompra')) },
            ],
          },
          {
            element: <RutaPorRol roles={['STAFF', 'ADMIN']} />,
            children: [
              { path: PATRONES.staffValidacion, ...perezosa(() => import('./pages/ValidacionIngreso')) },
              { path: PATRONES.staffTickets, ...perezosa(() => import('./pages/TicketsPagados')) },
            ],
          },
          {
            element: <RutaPorRol roles={['ADMIN']} />,
            children: [
              { path: PATRONES.adminEventos, ...perezosa(() => import('./pages/AdminEventos')) },
              { path: PATRONES.adminNuevo, ...perezosa(() => import('./pages/AdminNuevoEvento')) },
              { path: PATRONES.adminEvento, ...perezosa(() => import('./pages/AdminEvento')) },
            ],
          },
        ],
      },

      { path: PATRONES.sinPermisos, ...perezosa(() => import('./pages/SinPermisos')) },
      { path: '*', ...perezosa(() => import('./pages/NoEncontrada')) },
    ],
  },
];
