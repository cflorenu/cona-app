import { formatRecord, toPercentages } from './models';

describe('fight-night models', () => {
  it('formatRecord debe devolver el récord en formato V-D-E', () => {
    expect(formatRecord({ wins: 12, losses: 2, draws: 1 })).toBe('12-2-1');
  });

  it('toPercentages debe calcular porcentajes enteros por clave', () => {
    expect(toPercentages({ red: 62, blue: 38 })).toEqual({ red: 62, blue: 38 });
    expect(toPercentages({ koTko: 1, submission: 1, decision: 2 })).toEqual({ koTko: 25, submission: 25, decision: 50 });
  });

  it('toPercentages debe devolver 0 cuando no hay datos (evita división por cero)', () => {
    expect(toPercentages({ red: 0, blue: 0 })).toEqual({ red: 0, blue: 0 });
  });
});
