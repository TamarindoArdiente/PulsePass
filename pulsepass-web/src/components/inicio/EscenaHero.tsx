const CENTRO = { x: 160, y: 128 } as const;
const RADIO = 92;
const ANGULOS = Array.from({ length: 12 }, (_, i) => i * 30);

function enRadio(grados: number, radio: number) {
  const rad = (grados * Math.PI) / 180;
  return { x: CENTRO.x + radio * Math.sin(rad), y: CENTRO.y - radio * Math.cos(rad) };
}

const DUNA_ATRAS = 'M0 250C50 226 108 244 160 254S270 232 320 248V320H0Z';
const BORDE_DUNA_FRENTE = 'M0 270C60 248 120 266 176 272S280 258 320 266';
const DUNA_FRENTE = `${BORDE_DUNA_FRENTE}V320H0Z`;
/** [x, alto, color] de cada barra del ecualizador. */
const BARRAS: readonly (readonly [number, number, string])[] = [
  [56, 40, '#2ee6ff'],
  [68, 62, '#ff3ddb'],
  [80, 46, '#ffe45e'],
  [92, 28, '#2ee6ff'],
  [228, 28, '#2ee6ff'],
  [240, 46, '#ffe45e'],
  [252, 62, '#ff3ddb'],
  [264, 40, '#2ee6ff'],
];
const DESTELLO = 'M0-9 2.5-2.5 9 0 2.5 2.5 0 9-2.5 2.5-9 0-2.5-2.5Z';

/** Rueda con rayos y cabinas. Gira alrededor de su centro. */
function Rueda({ aro, aroInterior, rayos, cabinaRelleno, cabinaBorde }: {
  aro: string;
  aroInterior: string;
  rayos: string;
  cabinaRelleno: string;
  cabinaBorde: string;
}) {
  return (
    <g
      className="animate-[spin_120s_linear_infinite] motion-reduce:animate-none"
      style={{ transformOrigin: `${CENTRO.x}px ${CENTRO.y}px` }}
    >
      {ANGULOS.map((a) => {
        const p = enRadio(a, RADIO);
        return <line key={a} x1={CENTRO.x} y1={CENTRO.y} x2={p.x} y2={p.y} stroke={rayos} strokeWidth="2" />;
      })}
      <circle cx={CENTRO.x} cy={CENTRO.y} r={RADIO} fill="none" stroke={aro} strokeWidth="4.5" />
      <circle cx={CENTRO.x} cy={CENTRO.y} r={RADIO - 9} fill="none" stroke={aroInterior} strokeWidth="2" />
      {ANGULOS.map((a) => {
        const p = enRadio(a, RADIO);
        return <circle key={a} cx={p.x} cy={p.y} r="6.5" fill={cabinaRelleno} stroke={cabinaBorde} strokeWidth="2" />;
      })}
      <circle cx={CENTRO.x} cy={CENTRO.y} r="7" fill={aro} />
    </g>
  );
}

/** Patas de la rueda: salen del centro y se pierden detrás de las dunas. */
function Patas({ color }: { color: string }) {
  return (
    <g stroke={color} strokeWidth="5" strokeLinecap="round">
      <line x1={CENTRO.x} y1={CENTRO.y} x2="104" y2="296" />
      <line x1={CENTRO.x} y1={CENTRO.y} x2="216" y2="296" />
      <line x1="132" y1="214" x2="188" y2="214" strokeWidth="3" />
    </g>
  );
}

export function EscenaHero({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 320" className={className} aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="escena-sol" cx="38%" cy="32%" r="75%">
          <stop offset="0" stopColor="#fff1b8" />
          <stop offset="0.45" stopColor="#ffc233" />
          <stop offset="1" stopColor="#ff7a2f" />
        </radialGradient>
        <linearGradient id="escena-cielo-dia" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe3a0" />
          <stop offset="1" stopColor="#ff8f45" />
        </linearGradient>
        <linearGradient id="escena-cielo-noche" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b0f7a" />
          <stop offset="1" stopColor="#10031c" />
        </linearGradient>
        <clipPath id="escena-ventana">
          <circle cx="160" cy="160" r="158" />
        </clipPath>
        <radialGradient id="escena-fondo-noche" cx="50%" cy="40%" r="70%">
          <stop offset="0" stopColor="#5b21b6" />
          <stop offset="1" stopColor="#1a0830" />
        </radialGradient>
        <linearGradient id="escena-haz-cian" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#2ee6ff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#2ee6ff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="escena-haz-magenta" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ff3ddb" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ff3ddb" stopOpacity="0" />
        </linearGradient>
        {/* Palmera: la copa queda en (0,0) para poder colocarla y reflejarla con <use>. */}
        <g id="escena-palma" fill="none" stroke="#2b1208" strokeLinecap="round">
          <path d="M4 80Q10 40 0 0" strokeWidth="5" />
          <g strokeWidth="4.5">
            <path d="M0 0Q-22-14-42 2" />
            <path d="M0 0Q-18-30-40-28" />
            <path d="M0 0Q8-34 32-34" />
            <path d="M0 0Q26-14 44 6" />
            <path d="M0 0Q-4-26-2-42" />
          </g>
        </g>
      </defs>

      {/* ESCENA CLARA · Coachella */}
      <g className="opacity-100 dark:opacity-0">
        <g clipPath="url(#escena-ventana)">
        <circle cx="160" cy="160" r="160" fill="url(#escena-cielo-dia)" />
        <circle cx={CENTRO.x} cy={CENTRO.y} r="76" fill="url(#escena-sol)" />
        <Rueda aro="#2b1208" aroInterior="#2b1208" rayos="#2b1208" cabinaRelleno="#fff3e0" cabinaBorde="#2b1208" />
        <Patas color="#2b1208" />
        <path d={DUNA_ATRAS} fill="#8a3516" />
        <use href="#escena-palma" x="62" y="190" />
        <use href="#escena-palma" transform="translate(262 204) scale(-0.8 0.8)" />
        <path d={DUNA_FRENTE} fill="#2b1208" />
        </g>
        <circle cx="160" cy="160" r="158" fill="none" stroke="#fff3e0" strokeWidth="4" />
      </g>

      {/* ESCENA OSCURA · Disco */}
      <g className="opacity-0 dark:opacity-100">
        <g clipPath="url(#escena-ventana)">
        <circle cx="160" cy="160" r="160" fill="url(#escena-cielo-noche)" />
        <polygon points="160,296 14,40 62,22" fill="url(#escena-haz-cian)" />
        <polygon points="160,296 128,-8 192,-8" fill="url(#escena-haz-magenta)" />
        <polygon points="160,296 306,40 258,22" fill="url(#escena-haz-cian)" />
        <circle cx={CENTRO.x} cy={CENTRO.y} r="76" fill="url(#escena-fondo-noche)" />
        <g style={{ filter: 'drop-shadow(0 0 5px #2ee6ff)' }}>
          <Rueda aro="#2ee6ff" aroInterior="#ff3ddb" rayos="#c026d3" cabinaRelleno="#ffe45e" cabinaBorde="#ffffff" />
        </g>
        <Patas color="#8b5cf6" />
        <path d={DUNA_ATRAS} fill="#2a0f4a" />
        {/* Barras de ecualizador: el pulso del logo, convertido en pista de baile */}
        <g strokeLinecap="round" strokeWidth="7">
          {BARRAS.map(([x, alto, color]) => (
            <line key={x} x1={x} y1={266} x2={x} y2={266 - alto} stroke={color} />
          ))}
        </g>
        <path d={DUNA_FRENTE} fill="#10031c" />
        <path d={BORDE_DUNA_FRENTE} fill="none" stroke="#ff3ddb" strokeWidth="2" />
        <g fill="#ffffff">
          <path d={DESTELLO} transform="translate(64 62)" />
          <path d={DESTELLO} transform="translate(262 100) scale(0.8)" />
          <path d={DESTELLO} transform="translate(232 34) scale(0.6)" fill="#ffe45e" />
          <path d={DESTELLO} transform="translate(86 130) scale(0.5)" fill="#ffe45e" />
        </g>
        </g>
        <circle cx="160" cy="160" r="158" fill="none" stroke="#ff3ddb" strokeWidth="3" style={{ filter: 'drop-shadow(0 0 4px #ff3ddb)' }} />
      </g>
    </svg>
  );
}
