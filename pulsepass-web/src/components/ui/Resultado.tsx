import { esApiError } from '../../api/client';
import { EnlaceBoton } from './EnlaceBoton';
import { EstadoError } from './EstadoError';
import { EstadoVacio } from './EstadoVacio';

interface PropsErrorDeRecurso {
  error: unknown;
  /** Qué se buscaba, en singular y con artículo: "el artista", "la sede". */
  recurso: string;
  volverA: string;
  textoVolver: string;
  onReintentar: () => void;
}

/** 404 → "no encontrado" con salida; cualquier otro error → mensaje seguro + Reintentar. */
export function ErrorDeRecurso({ error, recurso, volverA, textoVolver, onReintentar }: PropsErrorDeRecurso) {
  if (esApiError(error) && error.status === 404) {
    return (
      <EstadoVacio
        titulo={`No encontramos ${recurso}`}
        descripcion="Puede que ya no exista o que la dirección no sea correcta."
        accion={<EnlaceBoton to={volverA}>{textoVolver}</EnlaceBoton>}
      />
    );
  }
  return <EstadoError error={error} onReintentar={onReintentar} />;
}
