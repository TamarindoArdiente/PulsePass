import { isRouteErrorResponse, useRouteError } from 'react-router';
import { EstadoError } from '../components/ui/EstadoError';

/** Último recurso del router: un fallo de render o de carga perezosa no deja la pantalla en blanco. */
export default function ErrorPagina() {
  const error = useRouteError();
  const mensaje = isRouteErrorResponse(error) ? undefined : error;
  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <EstadoError error={mensaje} titulo="Algo salió mal en esta página" onReintentar={() => window.location.reload()} />
    </main>
  );
}
