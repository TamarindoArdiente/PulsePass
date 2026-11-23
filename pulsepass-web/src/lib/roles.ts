import type { Rol } from '../types/dominio';

/** Prioridad para elegir el rol "principal" cuando una cuenta trae varios. */
const PRIORIDAD: readonly Rol[] = ['ADMIN', 'STAFF', 'USER'];

export function rolPrincipal(roles: readonly Rol[]): Rol {
  return PRIORIDAD.find((r) => roles.includes(r)) ?? 'USER';
}

export function tieneAlgunRol(rol: Rol, permitidos: readonly Rol[]): boolean {
  return permitidos.includes(rol);
}
