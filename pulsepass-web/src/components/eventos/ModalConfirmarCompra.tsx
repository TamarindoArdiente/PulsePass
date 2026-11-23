import { mensajeDeError } from '../../lib/errores';
import { etiquetaTipo } from '../../lib/tiposTicket';
import type { Evento, TipoTicket } from '../../types/dominio';
import { Aviso } from '../ui/Aviso';
import { Boton } from '../ui/Boton';
import { Modal } from '../ui/Modal';

interface PropsModalCompra {
  abierto: boolean;
  evento: Evento;
  tipo: TipoTicket;
  email: string;
  cargando: boolean;
  error: unknown;
  onConfirmar: () => void;
  onCerrar: () => void;
}

/** Un 409 (edad mínima, capacidad, estado…) se muestra aquí con el mensaje de la regla de negocio. */
export function ModalConfirmarCompra({ abierto, evento, tipo, email, cargando, error, onConfirmar, onCerrar }: PropsModalCompra) {
  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      titulo="Confirmar compra"
      pie={
        <>
          <Boton variante="secundario" onClick={onCerrar} disabled={cargando}>
            Cancelar
          </Boton>
          <Boton onClick={onConfirmar} cargando={cargando}>
            Confirmar
          </Boton>
        </>
      }
    >
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-tinta-suave">Evento</dt>
          <dd className="text-right font-bold">{evento.name}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-tinta-suave">Tipo de entrada</dt>
          <dd className="font-bold">{etiquetaTipo(tipo)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-tinta-suave">Cuenta</dt>
          <dd className="break-all text-right font-bold">{email}</dd>
        </div>
      </dl>
      <p className="mt-3 text-sm text-tinta-suave">El precio lo define el sistema al confirmar.</p>
      {error !== null && error !== undefined && (
        <Aviso tono="error" className="mt-4">
          {mensajeDeError(error)}
        </Aviso>
      )}
    </Modal>
  );
}
