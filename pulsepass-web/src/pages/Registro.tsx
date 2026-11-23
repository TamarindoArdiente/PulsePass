import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { esApiError } from '../api/client';
import { Aviso } from '../components/ui/Aviso';
import { Boton } from '../components/ui/Boton';
import { Campo } from '../components/ui/Campo';
import { IconoOjo, IconoOjoCerrado } from '../components/ui/iconos';
import { useRegistro } from '../hooks/useRegistro';
import { useTitulo } from '../hooks/useTitulo';
import { fortalezaContrasena } from '../lib/contrasena';
import { erroresPorCampo, mensajeDeError } from '../lib/errores';
import { RUTAS } from '../lib/rutas';
import { esquemaRegistro, type SolicitudRegistro } from '../types/solicitudes';

type CampoRegistro = 'username' | 'email' | 'firstName' | 'lastName' | 'birthDate' | 'password';
const CAMPOS: readonly CampoRegistro[] = ['username', 'email', 'firstName', 'lastName', 'birthDate', 'password'];

const ETIQUETA_FORTALEZA = { debil: 'Débil', media: 'Media', fuerte: 'Fuerte' } as const;
const COLOR_FORTALEZA = { debil: 'bg-red-500', media: 'bg-amber-500', fuerte: 'bg-emerald-500' } as const;

export default function Registro() {
  useTitulo('Crear cuenta');
  const navegar = useNavigate();
  const registrar = useRegistro();
  const [verClave, setVerClave] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const hoy = new Date().toISOString().slice(0, 10);

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SolicitudRegistro>({
    resolver: zodResolver(esquemaRegistro),
    defaultValues: { username: '', email: '', firstName: '', lastName: '', birthDate: '', password: '' },
  });

  const clave = watch('password');
  const fortaleza = fortalezaContrasena(clave);

  const enviar = handleSubmit((datos) => {
    setErrorGeneral(null);
    registrar.mutate(datos, {
      onSuccess: () => void navegar(RUTAS.login, { state: { registrado: true }, replace: true }),
      onError: (error) => {
        if (esApiError(error) && error.status === 409) {
          setErrorGeneral('El usuario o correo ya está registrado.');
          return;
        }
        // 400 con detalles por campo: se marcan en el formulario.
        const detalles = erroresPorCampo(error);
        let marcado = false;
        for (const campo of CAMPOS) {
          const mensaje = detalles[campo];
          if (mensaje) {
            setError(campo, { message: mensaje });
            marcado = true;
          }
        }
        if (!marcado) setErrorGeneral(mensajeDeError(error));
      },
    });
  });

  const cargando = isSubmitting || registrar.isPending;

  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded-3xl border border-borde bg-superficie p-6 shadow-tarjeta sm:p-8">
        <h1 className="mb-1 text-3xl sm:text-4xl">Crear cuenta</h1>
        <p className="mb-6 text-tinta-suave">Toma un minuto. Después podrás comprar tus entradas.</p>

        {errorGeneral && <Aviso tono="error" className="mb-5">{errorGeneral}</Aviso>}

        <form onSubmit={(e) => void enviar(e)} noValidate className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Nombre" autoComplete="given-name" error={errors.firstName?.message} {...register('firstName')} />
          <Campo etiqueta="Apellido" autoComplete="family-name" error={errors.lastName?.message} {...register('lastName')} />
          <Campo className="sm:col-span-2" etiqueta="Nombre de usuario" autoComplete="username" error={errors.username?.message} {...register('username')} />
          <Campo className="sm:col-span-2" etiqueta="Correo" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
          <Campo
            className="sm:col-span-2"
            etiqueta="Fecha de nacimiento"
            type="date"
            max={hoy}
            autoComplete="bday"
            error={errors.birthDate?.message}
            {...register('birthDate')}
          />
          <div className="sm:col-span-2">
            <Campo
              etiqueta="Contraseña"
              type={verClave ? 'text' : 'password'}
              autoComplete="new-password"
              ayuda="Mínimo 12 caracteres."
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
            {clave.length > 0 && (
              <div className="mt-2 flex items-center gap-3" aria-live="polite">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-superficie-2">
                  <div className={`h-full rounded-full transition-all ${COLOR_FORTALEZA[fortaleza.nivel]}`} style={{ width: `${(fortaleza.puntos / 5) * 100}%` }} />
                </div>
                <span className="text-sm font-bold">Seguridad: {ETIQUETA_FORTALEZA[fortaleza.nivel]}</span>
              </div>
            )}
          </div>
          <Boton type="submit" className="w-full sm:col-span-2" cargando={cargando}>
            Crear cuenta
          </Boton>
        </form>

        <p className="mt-6 text-center text-sm text-tinta-suave">
          ¿Ya tienes cuenta?{' '}
          <Link to={RUTAS.login} className="font-bold text-acento hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
