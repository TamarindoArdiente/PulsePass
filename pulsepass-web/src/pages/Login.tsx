import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router';
import { esApiError } from '../api/client';
import { Aviso } from '../components/ui/Aviso';
import { Boton } from '../components/ui/Boton';
import { Campo } from '../components/ui/Campo';
import { IconoOjo, IconoOjoCerrado } from '../components/ui/iconos';
import { useAuth } from '../hooks/useAuth';
import { useTitulo } from '../hooks/useTitulo';
import { mensajeDeError } from '../lib/errores';
import { destinoSeguro, leerEstadoNavegacion } from '../lib/navegacion';
import { RUTAS } from '../lib/rutas';
import { esquemaCredenciales, type Credenciales } from '../types/solicitudes';

export default function Login() {
  useTitulo('Iniciar sesión');
  const { iniciarSesion, motivoSalida, limpiarMotivoSalida } = useAuth();
  const ubicacion = useLocation();
  const navegar = useNavigate();
  const estado = leerEstadoNavegacion(ubicacion.state);
  const [verClave, setVerClave] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Credenciales>({ resolver: zodResolver(esquemaCredenciales), defaultValues: { identifier: '', password: '' } });

  const enviar = handleSubmit(async (datos) => {
    setErrorGeneral(null);
    try {
      await iniciarSesion(datos);
      limpiarMotivoSalida();
      void navegar(destinoSeguro(estado.desde), { replace: true });
    } catch (error) {
      // El backend responde 401 tanto si el usuario no existe como si la clave es incorrecta.
      setErrorGeneral(esApiError(error) && error.status === 401 ? 'Credenciales inválidas.' : mensajeDeError(error));
    }
  });

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-3xl border border-borde bg-superficie p-6 shadow-tarjeta sm:p-8">
        <h1 className="mb-1 text-3xl sm:text-4xl">Iniciar sesión</h1>
        <p className="mb-6 text-tinta-suave">Entra para comprar y ver tus entradas.</p>

        <div className="mb-5 space-y-3 empty:hidden">
          {estado.registrado && <Aviso tono="exito">Cuenta creada. Ya puedes iniciar sesión.</Aviso>}
          {motivoSalida === 'expirada' && <Aviso tono="aviso">Tu sesión expiró. Inicia sesión de nuevo.</Aviso>}
          {errorGeneral && <Aviso tono="error">{errorGeneral}</Aviso>}
        </div>

        <form onSubmit={(e) => void enviar(e)} noValidate className="space-y-4">
          <Campo
            etiqueta="Usuario o correo"
            autoComplete="username"
            error={errors.identifier?.message}
            {...register('identifier')}
          />
          <Campo
            etiqueta="Contraseña"
            type={verClave ? 'text' : 'password'}
            autoComplete="current-password"
            error={errors.password?.message}
            adorno={
              <button
                type="button"
                onClick={() => setVerClave((v) => !v)}
                aria-label={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                aria-pressed={verClave}
                className="grid size-10 place-items-center rounded-full text-tinta-suave hover:text-tinta"
              >
                {verClave ? <IconoOjoCerrado /> : <IconoOjo />}
              </button>
            }
            {...register('password')}
          />
          <Boton type="submit" className="w-full" cargando={isSubmitting}>
            Entrar
          </Boton>
        </form>

        <p className="mt-6 text-center text-sm text-tinta-suave">
          ¿No tienes cuenta?{' '}
          <Link to={RUTAS.registro} state={ubicacion.state} className="font-bold text-acento hover:underline">
            Crea una
          </Link>
        </p>
      </div>
    </div>
  );
}
