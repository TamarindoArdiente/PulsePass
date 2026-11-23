import clsx from 'clsx';

const COLORES = [
  'from-orange-400 to-rose-500',
  'from-fuchsia-500 to-violet-500',
  'from-sky-400 to-indigo-500',
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500',
  'from-pink-400 to-red-500',
] as const;

function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/);
  return ((partes[0]?.[0] ?? '') + (partes.length > 1 ? (partes[1]?.[0] ?? '') : '')).toUpperCase();
}

function indiceColor(nombre: string): number {
  let suma = 0;
  for (const letra of nombre) suma += letra.charCodeAt(0);
  return suma % COLORES.length;
}

export function AvatarArtista({ nombre, className }: { nombre: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={clsx(
        'grid shrink-0 place-items-center rounded-full bg-linear-to-br font-titulo font-extrabold text-white',
        COLORES[indiceColor(nombre)],
        className ?? 'size-14 text-lg',
      )}
    >
      {iniciales(nombre)}
    </span>
  );
}
