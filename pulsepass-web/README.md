# PulsePass · Frontend

Aplicación web para descubrir eventos, ver artistas y sedes, comprar entradas y gestionarlas.
Incluye el panel del personal (validación de ingreso) y el de administración (crear y publicar eventos).

**Stack:** React 19 · TypeScript · Vite · Tailwind CSS 4 · React Router · TanStack Query · React Hook Form + Zod · Vitest + Testing Library + MSW.

## Cómo ejecutarlo

Requisitos: Node 20 o superior y el backend de PulsePass corriendo en `http://localhost:8080`.

```bash
npm install
npm run dev
```

Abre <http://localhost:5173>. En desarrollo, Vite reenvía `/api` al backend (proxy), así el navegador
hace todas las peticiones al mismo origen. El backend también permite CORS para `http://localhost:5173`.

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Revisa los tipos y genera la versión de producción en `dist/` |
| `npm run preview` | Sirve la versión de producción |
| `npm run lint` | Revisa el código con ESLint |
| `npm test` | Ejecuta todas las pruebas una vez |
| `npm run test:watch` | Pruebas en modo observación |

## Roles y pantallas

| Rol | Puede |
|---|---|
| Sin sesión | Ver cartelera, eventos, artistas y sedes; iniciar sesión y crear cuenta |
| `USER` | Todo lo anterior + comprar entradas, ver y cancelar sus tickets, ver su cuenta |
| `STAFF` | Consultar eventos (incluidos borradores), ver tickets pagados y validar el ingreso |
| `ADMIN` | Todo lo del personal + crear eventos, asociar artistas y publicar |

Ocultar un botón o una ruta **no es seguridad**: cada endpoint también está protegido en el servidor,
y si responde 401/403/409 la interfaz muestra ese resultado.

## Estructura

```
src/
├── api/          Una función por endpoint. `client.ts` hace la petición, valida con zod y lanza `ApiError`.
├── hooks/        Envoltorios de TanStack Query (useQuery / useMutation). Invalidan la caché tras mutar.
├── context/      Sesión (AuthProvider) y tema (TemaProvider).
├── components/   ui/ (base), layout/, eventos/, artistas/, sedes/, tickets/
├── layouts/      Layout general y guardas de ruta (RutaProtegida, RutaPorRol, SoloAnonimo).
├── pages/        Una pantalla por ruta (se cargan de forma perezosa).
├── lib/          Lógica pura sin React: rutas, claves de caché, filtros, formato, errores…
├── types/        Esquemas zod del dominio y de los formularios.
├── styles/       Tokens de diseño (colores claro/oscuro).
├── rutas.tsx     Definición de las rutas  ·  router.tsx  Router del navegador.
└── test/         Configuración de pruebas, servidor falso (MSW) y datos de ejemplo.
```

## Decisiones de diseño y de código

- **Tema:** modo claro estilo Coachella (tonos cálidos) y modo oscuro estilo disco (tonos vibrantes).
  El interruptor usa los iconos `sol.svg` (modo claro) y `luna.svg` (modo oscuro). Se guarda en `localStorage`.
- **Sesión:** el token vive en `sessionStorage` y la identidad sale de `GET /api/auth/me`. Si el servidor
  responde 401 con un token, se cierra la sesión y se avisa "Tu sesión expiró".
- **Validación en dos capas:** zod valida lo que llega de la API y lo que escribe la persona; el backend sigue
  siendo la autoridad. Un 409 (regla de negocio) se muestra tal cual lo devuelve el servidor.
- **Compra:** la interfaz envía el correo de la sesión y el tipo de entrada. El precio lo fija el backend.
- **Redirecciones seguras:** el destino tras iniciar sesión solo acepta rutas internas (`destinoSeguro`).
- **Panel de administración:** la API no tiene "listar todos los eventos" y un borrador solo se consulta por su
  código. Por eso el panel muestra los publicados y recuerda en este navegador los códigos que la persona creó o abrió.
- **Accesibilidad:** enlace "Saltar al contenido", foco visible, foco al contenido en cada cambio de página,
  `<dialog>` nativo para los modales, mensajes de error con `role="alert"`, tablas con `<caption>` y
  respeto de `prefers-reduced-motion`.

## Pruebas

```bash
npm test
```

- **Lógica pura** (`src/lib/*.test.ts`, `src/types/*.test.ts`): reglas de compra, filtros, redirecciones seguras,
  mensajes de error, esquemas de formularios.
- **Pantallas** (`src/**/*.test.tsx`): se monta la aplicación real con un router en memoria y un servidor
  falso (MSW). Cubren guardas de ruta, login, compra de una entrada (incluido el 409 del servidor), cancelación,
  validación de ingreso y creación/publicación de eventos.

Las pruebas necesitan `jsdom` (`npm install -D jsdom`, ya incluido en `package.json`).
