import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Corner, Match, PredictionTally } from '../models';
import { BLUE, RED, makeMatch } from '../testing/fixtures';
import { MatchCardComponent } from './match-card.component';

describe('MatchCardComponent', () => {
  let fixture: ComponentFixture<MatchCardComponent>;
  let element: HTMLElement;
  let emitted: Corner[];

  const render = (match: Match, prediction?: PredictionTally, userPick: Corner | null = null): void => {
    fixture = TestBed.createComponent(MatchCardComponent);
    fixture.componentRef.setInput('match', match);
    if (prediction) {
      fixture.componentRef.setInput('prediction', prediction);
    }
    fixture.componentRef.setInput('userPick', userPick);
    emitted = [];
    fixture.componentInstance.predict.subscribe((c) => emitted.push(c));
    fixture.detectChanges();
    element = fixture.nativeElement;
  };
  const text = (selector: string): string | undefined => element.querySelector(selector)?.textContent?.trim();

  it('debe mostrar ambas esquinas con nombre, apodo opcional y récord', () => {
    render(makeMatch());

    const names = Array.from(element.querySelectorAll('.corner__name')).map((n) => n.textContent);
    expect(names).toEqual([RED.name, BLUE.name]);
    expect(element.querySelector('.corner--red .corner__nick')?.textContent).toBe('"Fuego"');
    expect(element.querySelector('.corner--blue .corner__nick')).toBeNull();
    expect(text('.corner--red .corner__record')).toBe('10-2-1');
    expect(element.querySelector('.corner--blue img')?.getAttribute('alt')).toBe('Foto de Azul Test');
  });

  it('debe tener un encabezado accesible que identifica el combate', () => {
    render(makeMatch());

    const article = element.querySelector('article')!;
    const heading = element.querySelector(`#${article.getAttribute('aria-labelledby')}`);
    expect(heading?.textContent).toBe('Rojo Test contra Azul Test');
  });

  it('debe mostrar división y rounds', () => {
    render(makeMatch({ rounds: 5 }));
    expect(text('.match__division')).toBe('Peso ligero · 5 rounds');

    render(makeMatch({ rounds: 1 }));
    expect(text('.match__division')).toBe('Peso ligero · 1 round');
  });

  it('debe mostrar los badges de main event y título solo cuando aplican', () => {
    render(makeMatch());
    expect(element.querySelectorAll('.badge')).toHaveSize(0);

    render(makeMatch({ isMainEvent: true, isTitleFight: true }));
    expect(element.querySelector('.match')!.classList).toContain('match--main');
    expect(text('.badge--main')).toBe('Main event');
    expect(text('.badge--title')).toBe('Pelea por el título');
  });

  it('en vivo debe mostrar el badge "En vivo" y no tener resultado', () => {
    render(makeMatch({ status: 'live' }));

    expect(text('.badge--live')).toContain('En vivo');
    expect(element.querySelector('.match__result')).toBeNull();
  });

  describe('resultado', () => {
    it('finalizado con ganador: resalta al ganador, atenúa al perdedor y describe el resultado', () => {
      render(makeMatch({
        status: 'finished',
        result: { winnerId: BLUE.id, method: 'Sumisión', round: 2, time: '3:45' }
      }));

      expect(element.querySelector('.corner--blue')!.classList).toContain('is-winner');
      expect(element.querySelector('.corner--red')!.classList).toContain('is-loser');
      expect(text('.corner--blue .corner__win')).toBe('Ganador');
      expect(text('.match__result')).toBe('Gana Azul Test por Sumisión · R2 · 3:45');
    });

    it('finalizado sin ganador (empate): no resalta esquinas', () => {
      render(makeMatch({ status: 'finished', result: { winnerId: null, method: 'Decisión dividida' } }));

      expect(element.querySelectorAll('.is-winner, .is-loser')).toHaveSize(0);
      expect(text('.match__result')).toBe('Sin ganador · Decisión dividida');
    });

    it('finalizado sin datos de resultado: no muestra resultado', () => {
      render(makeMatch({ status: 'finished' }));

      expect(element.querySelector('.match__result')).toBeNull();
      expect(element.querySelectorAll('.is-winner, .is-loser')).toHaveSize(0);
    });
  });

  describe('predicción del público', () => {
    it('sin datos de predicción no muestra el bloque', () => {
      render(makeMatch());
      expect(element.querySelector('.predict')).toBeNull();
    });

    it('debe mostrar porcentajes y barras proporcionales', () => {
      render(makeMatch(), { red: 75, blue: 25 });

      const buttons = Array.from(element.querySelectorAll<HTMLButtonElement>('.predict__btn'));
      expect(buttons.map((b) => b.textContent?.trim())).toEqual(['Rojo Test · 75%', 'Azul Test · 25%']);
      expect(element.querySelector<HTMLElement>('.predict__fill--red')!.style.width).toBe('75%');
      expect(element.querySelector<HTMLElement>('.predict__fill--blue')!.style.width).toBe('25%');
    });

    it('votar en un combate programado emite la esquina elegida', () => {
      render(makeMatch(), { red: 1, blue: 1 });

      element.querySelector<HTMLButtonElement>('.predict__btn--blue')!.click();

      expect(emitted).toEqual(['blue']);
    });

    it('debe marcar con aria-pressed el voto del usuario', () => {
      render(makeMatch(), { red: 1, blue: 1 }, 'red');

      expect(element.querySelector('.predict__btn--red')!.getAttribute('aria-pressed')).toBe('true');
      expect(element.querySelector('.predict__btn--blue')!.getAttribute('aria-pressed')).toBe('false');
    });

    it('no se puede votar en combates en vivo o finalizados', () => {
      render(makeMatch({ status: 'live' }), { red: 1, blue: 1 });

      const button = element.querySelector<HTMLButtonElement>('.predict__btn--red')!;
      expect(button.disabled).toBeTrue();

      fixture.componentInstance.vote('red');
      expect(emitted).toEqual([]);
    });
  });
});
