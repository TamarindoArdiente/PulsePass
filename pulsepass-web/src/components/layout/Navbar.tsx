import clsx from 'clsx';
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import { RUTAS } from '../../lib/rutas';
import type { Rol } from '../../types/dominio';
import { EnlaceBoton } from '../ui/EnlaceBoton';
import { Esqueleto } from '../ui/Cargando';
import { IconoCerrar, IconoMenu } from '../ui/iconos';
import { InterruptorTema } from './InterruptorTema';
import { Logo } from './Logo';
import { MenuUsuario } from './MenuUsuario';

interface Enlace {
  a: string;
  texto: string;
}

const ENLACES_PUBLICOS: readonly Enlace[] = [
  { a: RUTAS.eventos, texto: 'Eventos' },
  { a: RUTAS.artistas, texto: 'Artistas' },
  { a: RUTAS.sedes, texto: 'Sedes' },
];

/** Enlaces extra según el rol (PRD §8.4). */
function enlacesDelRol(rol: Rol | null): readonly Enlace[] {
  switch (rol) {
    case 'USER':
      return [{ a: RUTAS.misTickets, texto: 'Mis tickets' }];
    case 'STAFF':
      return [{ a: RUTAS.staffValidacion, texto: 'Validar ingreso' }];
    case 'ADMIN':
      return [
        { a: RUTAS.staffValidacion, texto: 'Validar ingreso' },
        { a: RUTAS.adminEventos, texto: 'Administrar eventos' },
      ];
    default:
      return [];
  }
}

const claseEnlace = ({ isActive }: { isActive: boolean }) =>
  clsx(
    'rounded-full px-4 py-2 text-sm font-bold transition-colors',
    isActive ? 'bg-primario text-tinta-primario' : 'text-tinta-suave hover:bg-superficie-2 hover:text-tinta',
  );

export function Navbar() {
  const { sesion, cerrarSesion } = useAuth();
  const navegar = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const rol = sesion.estado === 'autenticado' ? sesion.usuario.rol : null;
  const enlaces = [...ENLACES_PUBLICOS, ...enlacesDelRol(rol)];
  const cerrarMenu = () => setMenuAbierto(false);

  const salir = () => {
    cerrarMenu();
    cerrarSesion();
    void navegar(RUTAS.inicio);
  };

  return (
    <header className="sticky top-0 z-20 border-b border-borde bg-fondo/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-8">
        <Link to={RUTAS.inicio} aria-label="PulsePass, ir al inicio" onClick={cerrarMenu}>
          <Logo />
        </Link>

        <nav aria-label="Principal" className="ml-4 hidden items-center gap-1 md:flex">
          {enlaces.map((e) => (
            <NavLink key={e.a} to={e.a} className={claseEnlace}>
              {e.texto}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <InterruptorTema />
          <div className="hidden items-center gap-2 md:flex">
            {sesion.estado === 'cargando' && <Esqueleto className="h-10 w-28 rounded-full" />}
            {sesion.estado === 'anonimo' && (
              <>
                <EnlaceBoton to={RUTAS.login} variante="secundario" tamano="pequeno">
                  Ingresar
                </EnlaceBoton>
                <EnlaceBoton to={RUTAS.registro} tamano="pequeno">
                  Registrarse
                </EnlaceBoton>
              </>
            )}
            {sesion.estado === 'autenticado' && <MenuUsuario />}
          </div>
          <button
            type="button"
            aria-expanded={menuAbierto}
            aria-controls="menu-movil"
            aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setMenuAbierto((v) => !v)}
            className="grid size-11 place-items-center rounded-full border border-borde bg-superficie text-xl md:hidden"
          >
            {menuAbierto ? <IconoCerrar /> : <IconoMenu />}
          </button>
        </div>
      </div>

      {menuAbierto && (
        <nav id="menu-movil" aria-label="Menú móvil" className="border-t border-borde bg-fondo px-4 pb-5 pt-3 md:hidden">
          <ul className="flex flex-col gap-1">
            {enlaces.map((e) => (
              <li key={e.a}>
                <NavLink to={e.a} onClick={cerrarMenu} className={({ isActive }) => clsx(claseEnlace({ isActive }), 'block py-3 text-base')}>
                  {e.texto}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-col gap-2 border-t border-borde pt-4">
            {sesion.estado === 'anonimo' && (
              <>
                <EnlaceBoton to={RUTAS.login} variante="secundario" onClick={cerrarMenu}>
                  Ingresar
                </EnlaceBoton>
                <EnlaceBoton to={RUTAS.registro} onClick={cerrarMenu}>
                  Registrarse
                </EnlaceBoton>
              </>
            )}
            {sesion.estado === 'autenticado' && (
              <>
                <EnlaceBoton to={RUTAS.cuenta} variante="secundario" onClick={cerrarMenu}>
                  Mi cuenta ({sesion.usuario.username})
                </EnlaceBoton>
                <button type="button" onClick={salir} className="min-h-12 rounded-full text-base font-bold text-acento hover:bg-superficie-2">
                  Salir
                </button>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
