import { useContext } from 'react';
import { AuthContexto, type ValorAuth } from '../context/authContexto';

export function useAuth(): ValorAuth {
  const valor = useContext(AuthContexto);
  if (valor === null) throw new Error('useAuth debe usarse dentro de <AuthProvider>.');
  return valor;
}
