import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import { RUTAS } from '../../lib/rutas';
import { IconoChevronAbajo, IconoUsuario } from '../ui/iconos';

/** Menú de la persona con sesión: Mi cuenta · Mis tickets (solo USER) · Salir. */
export function MenuUsuario() {
  const { sesion, cerrarSesion } = useAuth();
  const navegar = useNavigate();
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);

  // Cierra con clic fuera o con Esc.
  useEffect(() => {
    if (!abierto) return;
    const alClic = (e: MouseEvent) => {
      if (contenedor.current && !contenedor.current.contains(e.target as Node)) setAbierto(false);
    };
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierto(false);
    };
    document.addEventListener('mousedown', alClic);
    document.addEventListener('keydown', alTeclear);
    return () => {
      document.removeEventListener('mousedown', alClic);
      document.removeEventListener('keydown', alTeclear);
    };
  }, [abierto]);

  if (sesion.estado !== 'autenticado') return null;
  const { usuario } = sesion;

  const salir = () => {
    setAbierto(false);
    cerrarSesion();
    void navegar(RUTAS.inicio);
  };

  const claseItem = 'block w-full rounded-xl px-3 py-2 text-left text-sm font-medium hover:bg-superficie-2';

  return (
    <div ref={contenedor} className="relative">
      <button
        type="button"
        aria-expanded={abierto}
        aria-haspopup="menu"
        onClick={() => setAbierto((v) => !v)}
        className="flex min-h-10 items-center gap-2 rounded-full border border-borde bg-superficie px-3 text-sm font-bold"
      >
        <IconoUsuario className="text-lg" />
        <span className="max-w-28 truncate">{usuario.username}</span>
        <IconoChevronAbajo />
      </button>
      {abierto && (
        <div role="menu" className="absolute right-0 z-30 mt-2 w-52 rounded-2xl border border-borde bg-superficie p-1.5 shadow-tarjeta">
          <Link role="menuitem" to={RUTAS.cuenta} onClick={() => setAbierto(false)} className={claseItem}>
            Mi cuenta
          </Link>
          {usuario.rol === 'USER' && (
            <Link role="menuitem" to={RUTAS.misTickets} onClick={() => setAbierto(false)} className={claseItem}>
              Mis tickets
            </Link>
          )}
          <button role="menuitem" type="button" onClick={salir} className={claseItem}>
            Salir
          </button>
        </div>
      )}
    </div>
  );
}
