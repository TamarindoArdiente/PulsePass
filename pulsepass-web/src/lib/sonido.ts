/**
 * Efecto de sonido opcional al cambiar de modo: se toca la nota real.
 *   Sol (G4) = 392 Hz  → modo claro
 *   La  (A4) = 440 Hz  → modo oscuro
 * Para desactivarlo, pon SONIDO_NOTAS_ACTIVO en false.
 *
 * Pensado también para el celular:
 *  - Un tono puro de ~400 Hz casi no se oye en el altavoz de un teléfono (rinde mal en graves).
 *    Por eso cada nota suena con su octava (el doble de frecuencia) y su quinta, que sí se reproducen
 *    bien, y con más volumen. Se sigue percibiendo como Sol o La.
 *  - Los navegadores móviles crean el audio "suspendido": se espera a que se reanude antes de sonar.
 *  - Safari antiguo (iPhone) solo ofrece `webkitAudioContext`.
 *  - Usa el volumen de multimedia del teléfono; en iPhone, además, el interruptor de silencio lo apaga.
 */
export const SONIDO_NOTAS_ACTIVO = true;

const FRECUENCIAS_HZ = { sol: 392.0, la: 440.0 } as const;

export type NotaMusical = keyof typeof FRECUENCIAS_HZ;

/** Parciales de la nota: [múltiplo de la frecuencia, volumen relativo]. */
const PARCIALES: readonly (readonly [number, number])[] = [
  [1, 1],
  [2, 0.7],
  [3, 0.35],
];

type ConstructorAudio = typeof AudioContext;

let contexto: AudioContext | null = null;

function obtenerContexto(): AudioContext | null {
  if (contexto !== null) return contexto;
  const Constructor: ConstructorAudio | undefined =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: ConstructorAudio }).webkitAudioContext;
  if (Constructor === undefined) return null;
  contexto = new Constructor();
  return contexto;
}

function sonar(ctx: AudioContext, nota: NotaMusical): void {
  const t0 = ctx.currentTime;
  const volumen = ctx.createGain();

  // Ataque rápido y caída suave.
  volumen.gain.setValueAtTime(0.0001, t0);
  volumen.gain.exponentialRampToValueAtTime(0.35, t0 + 0.02);
  volumen.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.7);
  volumen.connect(ctx.destination);

  for (const [multiplo, peso] of PARCIALES) {
    const oscilador = ctx.createOscillator();
    const parcial = ctx.createGain();
    oscilador.type = 'sine';
    oscilador.frequency.value = FRECUENCIAS_HZ[nota] * multiplo;
    parcial.gain.value = peso / 2;
    oscilador.connect(parcial).connect(volumen);
    oscilador.start(t0);
    oscilador.stop(t0 + 0.75);
  }
}

/** Debe llamarse desde un gesto de la persona (un toque o clic): los navegadores no dejan sonar sin él. */
export function tocarNota(nota: NotaMusical): void {
  if (!SONIDO_NOTAS_ACTIVO) return;
  try {
    const ctx = obtenerContexto();
    if (ctx === null) return;

    if (ctx.state === 'running') {
      sonar(ctx, nota);
    } else {
      // En móvil el contexto nace suspendido: se reanuda dentro del gesto y se toca al terminar.
      void ctx.resume().then(() => sonar(ctx, nota)).catch(() => undefined);
    }
  } catch {
    // El audio es un detalle decorativo: si falla, no pasa nada.
  }
}
