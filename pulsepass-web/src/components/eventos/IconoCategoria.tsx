import type { CategoriaEvento } from '../../types/dominio';
import {
  IconoCultura,
  IconoDeporte,
  IconoEducacion,
  IconoEntretenimiento,
  IconoNota,
  IconoTecnologia,
} from '../ui/iconos';

const ICONOS = {
  MUSIC: IconoNota,
  SPORTS: IconoDeporte,
  TECHNOLOGY: IconoTecnologia,
  EDUCATION: IconoEducacion,
  CULTURE: IconoCultura,
  ENTERTAINMENT: IconoEntretenimiento,
} satisfies Record<CategoriaEvento, typeof IconoNota>;

export function IconoCategoria({ categoria, className }: { categoria: CategoriaEvento; className?: string }) {
  const Icono = ICONOS[categoria];
  return <Icono className={className} />;
}
