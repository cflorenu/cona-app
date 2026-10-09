import { Component, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AnalyticsService, PLAUSIBLE_SCRIPT, TrackDirective } from './analytics.service';

type PlausibleWindow = Window & { plausible?: ((...args: unknown[]) => void) & { q?: unknown[] } };

describe('AnalyticsService', () => {
  let doc: Document;
  const win = (): PlausibleWindow => window as PlausibleWindow;
  const script = (): HTMLScriptElement | null => doc.head.querySelector(`script[src="${PLAUSIBLE_SCRIPT}"]`);

  beforeEach(() => {
    // document global (no TestBed.inject): los tests de servidor necesitan usar overrideProvider después.
    doc = document;
    delete win().plausible;
  });

  afterEach(() => {
    script()?.remove();
    delete win().plausible;
  });

  describe('init', () => {
    it('sin dominio configurado no debe cargar nada (desactivada por defecto)', () => {
      TestBed.inject(AnalyticsService).init('');

      expect(script()).toBeNull();
      expect(win().plausible).toBeUndefined();
    });

    it('con dominio debe cargar el script diferido y crear la cola de eventos', () => {
      const service = TestBed.inject(AnalyticsService);
      service.init('conatletas.pe');

      expect(script()!.defer).toBeTrue();
      expect(script()!.dataset['domain']).toBe('conatletas.pe');

      service.track('WhatsApp', { desde: 'header' });
      expect(win().plausible!.q).toEqual([['WhatsApp', { props: { desde: 'header' } }]]);
    });

    it('no debe duplicar el script ni reemplazar una función plausible existente', () => {
      const existing = jasmine.createSpy('plausible');
      win().plausible = existing;
      const service = TestBed.inject(AnalyticsService);

      service.init('conatletas.pe');
      service.init('conatletas.pe');

      expect(doc.head.querySelectorAll(`script[src="${PLAUSIBLE_SCRIPT}"]`)).toHaveSize(1);
      expect(win().plausible).toBe(existing);
    });

    it('en el servidor (prerender) no debe cargar el script', () => {
      TestBed.overrideProvider(PLATFORM_ID, { useValue: 'server' });

      TestBed.inject(AnalyticsService).init('conatletas.pe');

      expect(script()).toBeNull();
    });

    it('sin argumento usa el dominio del environment (vacío: desactivada)', () => {
      TestBed.inject(AnalyticsService).init();
      expect(script()).toBeNull();
    });
  });

  describe('track', () => {
    it('debe enviar el evento, con o sin propiedades', () => {
      const plausible = jasmine.createSpy('plausible');
      win().plausible = plausible;
      const service = TestBed.inject(AnalyticsService);

      service.track('Contacto');
      service.track('Solicitud clase gratis', { disciplina: 'Sambo' });

      expect(plausible.calls.allArgs()).toEqual([
        ['Contacto', undefined],
        ['Solicitud clase gratis', { props: { disciplina: 'Sambo' } }]
      ]);
    });

    it('sin Plausible cargado no debe fallar', () => {
      expect(() => TestBed.inject(AnalyticsService).track('Newsletter')).not.toThrow();
    });

    it('en el servidor no debe enviar nada', () => {
      const plausible = jasmine.createSpy('plausible');
      win().plausible = plausible;
      TestBed.overrideProvider(PLATFORM_ID, { useValue: 'server' });

      TestBed.inject(AnalyticsService).track('WhatsApp');

      expect(plausible).not.toHaveBeenCalled();
    });
  });
});

describe('TrackDirective', () => {
  @Component({
    imports: [TrackDirective],
    template: `
      <button id="con-origen" appTrack="Clase gratis" trackFrom="header">Clase gratis</button>
      <a id="sin-origen" appTrack="WhatsApp">WhatsApp</a>
    `
  })
  class HostComponent {}

  it('al hacer clic debe registrar la conversión con su ubicación', () => {
    const track = spyOn(TestBed.inject(AnalyticsService), 'track');
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;

    element.querySelector<HTMLElement>('#con-origen')!.click();
    element.querySelector<HTMLElement>('#sin-origen')!.click();

    expect(track.calls.allArgs()).toEqual([
      ['Clase gratis', { desde: 'header' }],
      ['WhatsApp', undefined]
    ]);
  });
});
