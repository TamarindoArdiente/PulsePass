import { useContext } from 'react';
import { TemaContexto, type ValorTema } from '../context/temaContexto';

export function useTema(): ValorTema {
  const valor = useContext(TemaContexto);
  if (valor === null) {
    throw new Error('useTema debe usarse dentro de <TemaProvider>.');
  }
  return valor;
}
