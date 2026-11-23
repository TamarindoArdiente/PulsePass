import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router';
import { Footer } from '../components/layout/Footer';
import { Navbar } from '../components/layout/Navbar';

/** Navbar + contenido + pie. Incluye "Saltar al contenido" y mueve el foco al cambiar de página. */
export default function Layout() {
  const { pathname } = useLocation();
  const principal = useRef<HTMLElement>(null);
  const primeraCarga = useRef(true);

  // Al navegar, el foco pasa al contenido para que teclado y lectores de pantalla sepan que cambió la página.
  useEffect(() => {
    if (primeraCarga.current) {
      primeraCarga.current = false;
      return;
    }
    principal.current?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-primario focus:px-4 focus:py-2 focus:font-bold focus:text-tinta-primario"
      >
        Saltar al contenido
      </a>
      <Navbar />
      <main id="contenido" ref={principal} tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 outline-none sm:px-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
