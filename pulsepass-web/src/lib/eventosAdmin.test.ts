import { describe, expect, it } from 'vitest';
import { leerCodigosAdmin, olvidarCodigoAdmin, recordarCodigoAdmin } from './eventosAdmin';

describe('lista de eventos del panel de administración', () => {
  it('empieza vacía', () => {
    expect(leerCodigosAdmin()).toEqual([]);
  });

  it('recuerda los códigos, el más reciente primero y sin duplicados', () => {
    recordarCodigoAdmin('A');
    recordarCodigoAdmin('B');
    recordarCodigoAdmin('A');
    expect(leerCodigosAdmin()).toEqual(['A', 'B']);
  });

  it('ignora códigos vacíos', () => {
    recordarCodigoAdmin('   ');
    expect(leerCodigosAdmin()).toEqual([]);
  });

  it('olvida un código', () => {
    recordarCodigoAdmin('A');
    recordarCodigoAdmin('B');
    expect(olvidarCodigoAdmin('A')).toEqual(['B']);
  });

  it('tolera datos corruptos en el almacenamiento', () => {
    localStorage.setItem('pulsepass:admin-eventos', '{no es json');
    expect(leerCodigosAdmin()).toEqual([]);
    localStorage.setItem('pulsepass:admin-eventos', JSON.stringify([1, 2]));
    expect(leerCodigosAdmin()).toEqual([]);
  });
});
