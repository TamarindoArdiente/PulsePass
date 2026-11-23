import { Link } from 'react-router';
import { RUTAS } from '../../lib/rutas';

export function Footer() {
  return (
    <footer className="border-t border-borde">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-tinta-suave sm:px-8">
        <p>© 2026 PulsePass · Caso de estudio académico</p>
        <nav aria-label="Pie de página" className="flex gap-4 font-medium">
          <Link to={RUTAS.sedes} className="hover:text-tinta">
            Sedes
          </Link>
          <Link to={RUTAS.artistas} className="hover:text-tinta">
            Artistas
          </Link>
        </nav>
      </div>
    </footer>
  );
}
