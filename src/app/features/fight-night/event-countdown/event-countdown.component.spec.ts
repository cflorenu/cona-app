import { PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventCountdownComponent, splitDuration } from './event-countdown.component';

describe('EventCountdownComponent', () => {
  let fixture: ComponentFixture<EventCountdownComponent>;
  let element: HTMLElement;
  let started: number;
  const NOW = new Date('2030-01-01T12:00:00.000Z');

  // Reloj simulado de Jasmine (timers + Date): no requiere zone.js, igual que la app zoneless.
  beforeEach(() => {
    jasmine.clock().install();
    jasmine.clock().mockDate(NOW);
  });
  afterEach(() => jasmine.clock().uninstall());

  const inMs = (ms: number): string => new Date(NOW.getTime() + ms).toISOString();
  const render = (target: string): void => {
    fixture = TestBed.createComponent(EventCountdownComponent);
    fixture.componentRef.setInput('target', target);
    started = 0;
    fixture.componentInstance.started.subscribe(() => started++);
    fixture.detectChanges();
    element = fixture.nativeElement;
  };
  const values = (): (string | undefined)[] =>
    Array.from(element.querySelectorAll('.countdown__value')).map((v) => v.textContent?.trim());

  it('splitDuration debe descomponer milisegundos en días, horas, minutos y segundos', () => {
    const ms = ((2 * 24 + 3) * 3600 + 4 * 60 + 5) * 1000;
    expect(splitDuration(ms)).toEqual({ days: 2, hours: 3, minutes: 4, seconds: 5 });
  });

  it('debe mostrar el tiempo restante con dos dígitos y una etiqueta accesible', () => {
    render(inMs(((1 * 24 + 2) * 3600 + 3 * 60 + 4) * 1000 + 500));

    expect(values()).toEqual(['01', '02', '03', '04']);
    const timer = element.querySelector('[role="timer"]')!;
    expect(timer.getAttribute('aria-live')).toBe('off');
    expect(timer.getAttribute('aria-label')).toBe('Faltan 1 días, 2 horas y 3 minutos');
  });

  it('debe actualizarse cada segundo', () => {
    render(inMs(65_500));
    expect(values()).toEqual(['00', '00', '01', '05']);

    jasmine.clock().tick(1000);
    fixture.detectChanges();

    expect(values()).toEqual(['00', '00', '01', '04']);
  });

  it('al llegar a cero debe mostrar "En vivo", emitir started una vez y detenerse', () => {
    render(inMs(1_500));

    jasmine.clock().tick(2000);
    fixture.detectChanges();

    expect(element.querySelector('.countdown--live')?.textContent).toContain('En vivo ahora');
    expect(started).toBe(1);

    jasmine.clock().tick(5000);
    expect(started).toBe(1);
  });

  it('si el evento ya empezó debe mostrar "En vivo" sin volver a emitir started', () => {
    render(inMs(-60_000));
    jasmine.clock().tick(5000);

    expect(element.querySelector('.countdown--live')).not.toBeNull();
    expect(started).toBe(0);
  });

  it('en el servidor (prerender) no debe iniciar el intervalo: el valor queda fijo', () => {
    TestBed.overrideProvider(PLATFORM_ID, { useValue: 'server' });
    render(inMs(60_000));

    jasmine.clock().tick(3000);
    fixture.detectChanges();

    expect(values()).toEqual(['00', '00', '01', '00']);
  });

  it('debe limpiar el intervalo al destruirse (no emite después)', () => {
    render(inMs(1_500));

    fixture.destroy();
    jasmine.clock().tick(5000);

    expect(started).toBe(0);
  });
});
