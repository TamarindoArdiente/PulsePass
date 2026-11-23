import { useNavigate } from 'react-router';
import { Boton } from '../components/ui/Boton';
import { Esqueleto } from '../components/ui/Cargando';
import { EstadoError } from '../components/ui/EstadoError';
import { useAuth } from '../hooks/useAuth';
import { usePerfil } from '../hooks/useUsuario';
import { useTitulo } from '../hooks/useTitulo';
import { formatearFecha } from '../lib/formato';
import { RUTAS } from '../lib/rutas';
import type { Rol } from '../types/dominio';

const ETIQUETA_ROL: Record<Rol, string> = { USER: 'Usuario', STAFF: 'Personal', ADMIN: 'Administrador' };

export default function Cuenta() {
  useTitulo('Mi cuenta');
  const { sesion, cerrarSesion } = useAuth();
  const navegar = useNavigate();
  const username = sesion.estado === 'autenticado' ? sesion.usuario.username : undefined;
  const consulta = usePerfil(username);

  if (sesion.estado !== 'autenticado') return null; // las guardas del router ya lo impiden

  const salir = () => {
    cerrarSesion();
    void navegar(RUTAS.inicio);
  };

  const perfil = consulta.data;
  const datos: readonly { etiqueta: string; valor: string }[] = perfil
    ? [
        { etiqueta: 'Nombre', valor: `${perfil.firstName} ${perfil.lastName}` },
        { etiqueta: 'Usuario', valor: perfil.username },
        { etiqueta: 'Correo', valor: perfil.email },
        { etiqueta: 'Teléfono', valor: perfil.phone || 'No registrado' },
        { etiqueta: 'Ciudad', valor: perfil.city || 'No registrada' },
        { etiqueta: 'Fecha de nacimiento', valor: perfil.birthDate ? formatearFecha(perfil.birthDate) : 'No registrada' },
      ]
    : [];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-4xl sm:text-5xl">Mi cuenta</h1>

      <section aria-labelledby="titulo-sesion" className="rounded-3xl border border-borde bg-superficie p-6 shadow-tarjeta sm:p-8">
        <h2 id="titulo-sesion" className="mb-3 text-2xl">
          Sesión
        </h2>
        <p className="text-lg">
          Entraste como <strong>{sesion.usuario.username}</strong>
        </p>
        <p className="mt-1 text-tinta-suave">Rol: {sesion.usuario.roles.map((r) => ETIQUETA_ROL[r]).join(', ')}</p>
      </section>

      <section aria-labelledby="titulo-perfil" className="rounded-3xl border border-borde bg-superficie p-6 shadow-tarjeta sm:p-8">
        <h2 id="titulo-perfil" className="mb-4 text-2xl">
          Tus datos
        </h2>
        {consulta.isPending && <Esqueleto className="h-40" />}
        {consulta.isError && <EstadoError error={consulta.error} titulo="No pudimos cargar tus datos" onReintentar={() => void consulta.refetch()} />}
        {perfil && (
          <dl className="grid gap-4 sm:grid-cols-2">
            {datos.map((d) => (
              <div key={d.etiqueta} className="min-w-0">
                <dt className="text-sm font-bold text-tinta-suave">{d.etiqueta}</dt>
                <dd className="break-words text-lg">{d.valor}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      <Boton variante="secundario" onClick={salir}>
        Cerrar sesión
      </Boton>
    </div>
  );
}
