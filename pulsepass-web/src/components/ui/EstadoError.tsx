import { mensajeDeError } from '../../lib/errores';
import { Boton } from './Boton';
import { IconoAlerta, IconoReintentar } from './iconos';

interface PropsEstadoError {
  error?: unknown;
  titulo?: string;
  onReintentar?: () => void;
}

/** Error de carga: mensaje seguro (sin detalles internos) + "Reintentar" (refetch). */
export function EstadoError({ error, titulo = 'No pudimos cargar esta información', onReintentar }: PropsEstadoError) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-3xl border border-red-400/50 bg-red-50 px-6 py-12 text-center dark:bg-red-400/10">
      <IconoAlerta className="text-4xl text-red-600 dark:text-red-300" />
      <h2 className="text-xl">{titulo}</h2>
      <p className="max-w-md text-tinta-suave">{mensajeDeError(error)}</p>
      {onReintentar && (
        <Boton variante="secundario" onClick={onReintentar}>
          <IconoReintentar /> Reintentar
        </Boton>
      )}
    </div>
  );
}
