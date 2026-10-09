import { DOCUMENT } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DEMO_EVENT, DEMO_FIGHTERS, DEMO_PREDICTIONS } from '../data/demo-event';
import { EventsPreviewComponent } from './events-preview.component';

describe('EventsPreviewComponent', () => {
  let fixture: ComponentFixture<EventsPreviewComponent>;
  let component: EventsPreviewComponent;
  let element: HTMLElement;
  let doc: Document;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventsPreviewComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    doc = TestBed.inject(DOCUMENT);
    fixture = TestBed.createComponent(EventsPreviewComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('debe avisar que son datos de demostración', () => {
    expect(element.querySelector('.demo-banner')?.textContent).toContain('datos de demostración');
  });

  it('el hero debe mostrar nombre, fecha legible con <time> y countdown', () => {
    expect(element.querySelector('h1')?.textContent).toBe(DEMO_EVENT.name);
    expect(element.querySelector('time')?.getAttribute('datetime')).toBe(DEMO_EVENT.startDate);
    expect(element.querySelector('time')?.textContent).toMatch(/^Sábado, 12 de diciembre de 2026/);
    expect(element.querySelector('app-event-countdown')).not.toBeNull();
  });

  it('sin entradas a la venta no debe mostrar el CTA de compra', () => {
    expect(element.querySelector('.event-hero__cta')).toBeNull();
  });

  it('la cartelera debe empezar por el main event', () => {
    const cards = element.querySelectorAll('app-match-card');

    expect(cards).toHaveSize(DEMO_EVENT.matches.length);
    expect(cards[0].querySelector('.badge--main')).not.toBeNull();
  });

  it('debe mostrar el roster completo', () => {
    expect(element.querySelectorAll('app-fighter-profile-card')).toHaveSize(DEMO_FIGHTERS.length);
  });

  it('debe publicar el JSON-LD del evento y del roster, y retirarlo al salir de la página', () => {
    const event = doc.getElementById('jsonld-event')!;
    expect(JSON.parse(event.textContent!)['@type']).toBe('SportsEvent');
    expect(JSON.parse(doc.getElementById('jsonld-roster')!.textContent!)).toHaveSize(DEMO_FIGHTERS.length);

    fixture.destroy();

    expect(doc.getElementById('jsonld-event')).toBeNull();
    expect(doc.getElementById('jsonld-roster')).toBeNull();
  });

  describe('modo oscuro/claro', () => {
    it('debe iniciar en oscuro y alternar con el botón', () => {
      const root = element.querySelector('.fight-night')!;
      const toggle = element.querySelector<HTMLButtonElement>('.theme-toggle')!;
      expect(root.getAttribute('data-theme')).toBe('dark');
      expect(toggle.getAttribute('aria-label')).toBe('Cambiar a modo claro');

      toggle.click();
      fixture.detectChanges();
      expect(root.getAttribute('data-theme')).toBe('light');
      expect(toggle.getAttribute('aria-label')).toBe('Cambiar a modo oscuro');

      toggle.click();
      fixture.detectChanges();
      expect(root.getAttribute('data-theme')).toBe('dark');
    });
  });

  describe('predicciones', () => {
    it('votar suma un voto y marca la elección del usuario', () => {
      component.vote('m1', 'red');

      expect(component.predictions()['m1'].red).toBe(DEMO_PREDICTIONS['m1'].red + 1);
      expect(component.picks()['m1']).toBe('red');
    });

    it('votar dos veces la misma esquina no duplica el voto', () => {
      component.vote('m1', 'red');
      component.vote('m1', 'red');

      expect(component.predictions()['m1'].red).toBe(DEMO_PREDICTIONS['m1'].red + 1);
    });

    it('cambiar de esquina mueve el voto', () => {
      component.vote('m1', 'red');
      component.vote('m1', 'blue');

      expect(component.predictions()['m1']).toEqual({
        red: DEMO_PREDICTIONS['m1'].red,
        blue: DEMO_PREDICTIONS['m1'].blue + 1
      });
      expect(component.picks()['m1']).toBe('blue');
    });

    it('el clic en el Match Card debe registrar el voto', () => {
      element.querySelector<HTMLButtonElement>('app-match-card .predict__btn--blue')!.click();
      fixture.detectChanges();

      expect(component.picks()['m1']).toBe('blue');
      expect(element.querySelector('app-match-card .predict__btn--blue')!.getAttribute('aria-pressed')).toBe('true');
    });
  });

  it('cuando arranca el evento el hero debe pasar a "En vivo"', () => {
    expect(element.querySelector('.event-hero__kicker')?.textContent).toBe('Próximo evento');

    component.onStarted();
    fixture.detectChanges();

    expect(element.querySelector('.event-hero__kicker')?.textContent).toBe('En vivo');
  });
});
