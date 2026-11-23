import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { servidor } from './servidor';

// jsdom no trae matchMedia (lo usa el proveedor de tema).
if (typeof window.matchMedia !== 'function') {
  window.matchMedia = (consulta: string) =>
    ({
      matches: false,
      media: consulta,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

// jsdom (según versión) no implementa <dialog>.showModal()/close(); el Modal los necesita.
if (typeof HTMLDialogElement !== 'undefined' && typeof HTMLDialogElement.prototype.showModal !== 'function') {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
}

// jsdom tampoco hace scroll.
window.scrollTo = () => undefined;

beforeAll(() => {
  servidor.listen({ onUnhandledFrame: 'error' });

  // La app llama a rutas relativas ("/api/..."); el fetch de Node exige URL absoluta.
  // Se envuelve DESPUÉS de servidor.listen() para que MSW reciba ya la URL completa.
  const fetchConMsw = globalThis.fetch.bind(globalThis);
  globalThis.fetch = (entrada, init) =>
    fetchConMsw(typeof entrada === 'string' && entrada.startsWith('/') ? `http://localhost${entrada}` : entrada, init);
});

afterEach(() => {
  cleanup();
  servidor.resetHandlers();
  sessionStorage.clear();
  localStorage.clear();
});

afterAll(() => servidor.close());
