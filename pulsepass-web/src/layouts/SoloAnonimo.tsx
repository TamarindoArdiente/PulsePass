import { Navigate, Outlet, useLocation } from 'react-router';
import { Cargando } from '../components/ui/Cargando';
import { useAuth } from '../hooks/useAuth';
import { destinoSeguro, leerEstadoNavegacion } from '../lib/navegacion';

/** Login y registro: si ya hay sesión, redirige al destino pendiente (o al inicio). */
export default function SoloAnonimo() {
  const { sesion } = useAuth();
  const ubicacion = useLocation();

  if (sesion.estado === 'cargando') return <Cargando texto="Verificando tu sesión…" />;
  if (sesion.estado === 'autenticado') {
    return <Navigate to={destinoSeguro(leerEstadoNavegacion(ubicacion.state).desde)} replace />;
  }
  return <Outlet />;
}
