import { EnlaceBoton } from '../components/ui/EnlaceBoton';
import { EstadoVacio } from '../components/ui/EstadoVacio';
import { IconoBuscar } from '../components/ui/iconos';
import { useTitulo } from '../hooks/useTitulo';
import { RUTAS } from '../lib/rutas';

export default function NoEncontrada() {
  useTitulo('Página no encontrada');
  return (
    <EstadoVacio
      icono={<IconoBuscar />}
      titulo="Página no encontrada"
      descripcion="La dirección no existe o fue movida."
      accion={<EnlaceBoton to={RUTAS.eventos}>Ver la cartelera</EnlaceBoton>}
    />
  );
}
