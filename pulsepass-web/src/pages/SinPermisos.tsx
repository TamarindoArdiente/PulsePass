import { EnlaceBoton } from '../components/ui/EnlaceBoton';
import { EstadoVacio } from '../components/ui/EstadoVacio';
import { IconoAlerta } from '../components/ui/iconos';
import { useTitulo } from '../hooks/useTitulo';
import { RUTAS } from '../lib/rutas';

export default function SinPermisos() {
  useTitulo('Sin permisos');
  return (
    <EstadoVacio
      icono={<IconoAlerta />}
      titulo="No tienes permisos para ver esta página"
      descripcion="Tu cuenta no tiene el rol necesario. Si crees que es un error, contacta a un administrador."
      accion={<EnlaceBoton to={RUTAS.inicio}>Ir al inicio</EnlaceBoton>}
    />
  );
}
