import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EVENT_SOURCE_FACTORY } from './live-feed.service';
import { FakeEventSource } from '../testing/fake-event-source';
import { LiveTickerComponent } from './live-ticker.component';

describe('LiveTickerComponent', () => {
  let fixture: ComponentFixture<LiveTickerComponent>;
  let element: HTMLElement;
  let source: FakeEventSource;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: EVENT_SOURCE_FACTORY,
          useValue: (url: string) => (source = new FakeEventSource(url))
        }
      ]
    });
    fixture = TestBed.createComponent(LiveTickerComponent);
    fixture.componentRef.setInput('url', '/live');
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  const status = (): string | undefined => element.querySelector('.ticker__status')?.textContent?.trim();

  it('debe conectarse al feed indicado y mostrar el estado', () => {
    expect(source.url).toBe('/live');
    expect(status()).toBe('Conectando…');

    source.onopen!(new Event('open'));
    fixture.detectChanges();

    expect(status()).toBe('En vivo');
    expect(element.querySelector('.ticker__status .live-dot')).not.toBeNull();
  });

  it('sin actualizaciones debe mostrar el mensaje de espera', () => {
    expect(element.querySelector('.ticker__empty')?.textContent).toContain('Esperando');
  });

  it('debe listar las actualizaciones en una región accesible, la más reciente primero', () => {
    source.emit({ id: '1', matchId: 'm2', kind: 'info', text: 'Arranca el combate', round: 1, time: '5:00' });
    source.emit({ id: '2', matchId: 'm2', kind: 'result', text: 'Final por KO' });
    fixture.detectChanges();

    const log = element.querySelector('[role="log"]')!;
    expect(log.getAttribute('aria-live')).toBe('polite');
    const items = Array.from(log.querySelectorAll('.ticker__item'));
    expect(items.map((i) => i.querySelector('.ticker__text')?.textContent)).toEqual(['Final por KO', 'Arranca el combate']);
    expect(items[0].classList).toContain('ticker__item--result');
    expect(items[0].querySelector('.ticker__time')).toBeNull();
    expect(items[1].querySelector('.ticker__time')?.textContent?.replace(/\s+/g, ' ').trim()).toBe('R1 · 5:00');
  });

  it('una actualización con round pero sin tiempo muestra solo el round', () => {
    source.emit({ id: '1', matchId: 'm2', kind: 'score', text: 'Derribo', round: 2 });
    fixture.detectChanges();

    expect(element.querySelector('.ticker__time')?.textContent?.trim()).toBe('R2');
  });

  it('debe cerrar la conexión al destruirse', () => {
    fixture.destroy();
    expect(source.close).toHaveBeenCalled();
  });
});
