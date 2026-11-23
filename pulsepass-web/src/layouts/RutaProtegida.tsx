import { Navigate, Outlet, useLocation } from 'react-router';
import { Cargando } from '../components/ui/Cargando';
import { useAuth } from '../hooks/useAuth';
import { RUTAS } from '../lib/rutas';

/** Exige sesión. Sin ella, va a /login recordando a dónde quería ir (state.desde). */
export default function RutaProtegida() {
  const { sesion } = useAuth();
  const ubicacion = useLocation();

  if (sesion.estado === 'cargando') return <Cargando texto="Verificando tu sesión…" />;
  if (sesion.estado === 'anonimo') {
    return <Navigate to={RUTAS.login} replace state={{ desde: ubicacion.pathname + ubicacion.search }} />;
  }
  return <Outlet />;
}
