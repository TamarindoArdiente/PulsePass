import { createContext } from 'react';
import type { Modo } from '../types/dominio';

export interface ValorTema {
  modo: Modo;
  esOscuro: boolean;
  elegir: (modo: Modo) => void;
  alternar: () => void;
}
export const TemaContexto = createContext<ValorTema | null>(null);
