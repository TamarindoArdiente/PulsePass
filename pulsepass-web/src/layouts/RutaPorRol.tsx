import { Navigate, Outlet, useLocation } from 'react-router';
import { Cargando } from '../components/ui/Cargando';
import { useAuth } from '../hooks/useAuth';
import { RUTAS } from '../lib/rutas';
import type { Rol } from '../types/dominio';

/**
 * Deja pasar solo a los roles indicados. Ocultar una ruta aquí NO es seguridad:
 * cada endpoint está protegido también en el servidor, y un 403 del servidor siempre prevalece.
 */
export default function RutaPorRol({ roles }: { roles: readonly Rol[] }) {
  const { sesion } = useAuth();
  const ubicacion = useLocation();

  if (sesion.estado === 'cargando') return <Cargando texto="Verificando tu sesión…" />;
  if (sesion.estado === 'anonimo') {
    return <Navigate to={RUTAS.login} replace state={{ desde: ubicacion.pathname + ubicacion.search }} />;
  }
  if (!roles.some((r) => sesion.usuario.roles.includes(r))) {
    return <Navigate to={RUTAS.sinPermisos} replace />;
  }
  return <Outlet />;
}
