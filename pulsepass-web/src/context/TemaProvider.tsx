import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { esquemaModo, type Modo } from '../types/dominio';
import { tocarNota } from '../lib/sonido';
import { TemaContexto, type ValorTema } from './temaContexto';

const CLAVE_ALMACEN = 'pulsepass:tema';
const DURACION_TRANSICION_MS = 650;
const COLOR_BARRA: Record<Modo, string> = { claro: '#FFF8EC', oscuro: '#09040F' };

/** Lee la preferencia guardada y la valida con zod (FE-002). */
function leerGuardado(): Modo | null {
  try {
    const crudo = localStorage.getItem(CLAVE_ALMACEN);
    if (crudo === null) return null;
    const resultado = esquemaModo.safeParse(crudo);
    return resultado.success ? resultado.data : null;
  } catch {
    return null;
  }
}

function guardar(modo: Modo): void {
  try {
    localStorage.setItem(CLAVE_ALMACEN, modo);
  } catch {
    // Almacenamiento bloqueado: el modo sigue funcionando en esta visita.
  }
}

function preferenciaDelSistema(): Modo {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro';
}

/** Refleja el modo en <html>: clase .dark, color-scheme nativo y color de la barra del navegador. */
function aplicarAlDocumento(modo: Modo): void {
  const raiz = document.documentElement;
  raiz.classList.toggle('dark', modo === 'oscuro');
  raiz.style.colorScheme = modo === 'oscuro' ? 'dark' : 'light';
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', COLOR_BARRA[modo]);
}

interface TemaProviderProps {
  children: ReactNode;
}

export function TemaProvider({ children }: TemaProviderProps) {
  const [modo, setModo] = useState<Modo>(() => leerGuardado() ?? preferenciaDelSistema());
  const temporizador = useRef<number | undefined>(undefined);

  // Sincroniza <html> con el estado.
  useEffect(() => {
    aplicarAlDocumento(modo);
  }, [modo]);

  // Si la persona nunca eligió, se acompaña al sistema operativo cuando cambia.
  useEffect(() => {
    const consulta = window.matchMedia('(prefers-color-scheme: dark)');
    const alCambiar = () => {
      if (leerGuardado() === null) setModo(consulta.matches ? 'oscuro' : 'claro');
    };
    consulta.addEventListener('change', alCambiar);
    return () => consulta.removeEventListener('change', alCambiar);
  }, []);

  // Limpia el temporizador de la transición al desmontar.
  useEffect(() => () => window.clearTimeout(temporizador.current), []);

  const elegir = useCallback(
    (nuevo: Modo) => {
      if (nuevo === modo) return;

      // Activa la transición suave solo mientras dura el cambio.
      const raiz = document.documentElement;
      raiz.classList.add('transicion-tema');
      window.clearTimeout(temporizador.current);
      temporizador.current = window.setTimeout(() => {
        raiz.classList.remove('transicion-tema');
      }, DURACION_TRANSICION_MS);

      setModo(nuevo);
      guardar(nuevo);
      tocarNota(nuevo === 'claro' ? 'sol' : 'la');
    },
    [modo],
  );

  const alternar = useCallback(() => {
    elegir(modo === 'claro' ? 'oscuro' : 'claro');
  }, [elegir, modo]);

  const valor = useMemo<ValorTema>(
    () => ({ modo, esOscuro: modo === 'oscuro', elegir, alternar }),
    [modo, elegir, alternar],
  );

  return <TemaContexto value={valor}>{children}</TemaContexto>;
}
