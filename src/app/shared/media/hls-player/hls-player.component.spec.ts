import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HLS_LOADER, HlsConstructor, HlsInstance, HlsPlayerComponent } from './hls-player.component';

class FakeHls implements HlsInstance {
  static supported = true;
  static instances: FakeHls[] = [];
  static readonly Events = { ERROR: 'hlsError' };
  static isSupported(): boolean {
    return FakeHls.supported;
  }

  readonly handlers = new Map<string, (event: string, data: { fatal?: boolean }) => void>();
  readonly loadSource = jasmine.createSpy('loadSource');
  readonly attachMedia = jasmine.createSpy('attachMedia');
  readonly destroy = jasmine.createSpy('destroy');

  constructor(readonly config?: Record<string, unknown>) {
    FakeHls.instances.push(this);
  }

  on(event: string, handler: (event: string, data: { fatal?: boolean }) => void): void {
    this.handlers.set(event, handler);
  }
}

describe('HlsPlayerComponent', () => {
  let fixture: ComponentFixture<HlsPlayerComponent>;
  let component: HlsPlayerComponent;
  let element: HTMLElement;
  let loader: jasmine.Spy<() => Promise<HlsConstructor>>;
  let canPlayType: jasmine.Spy;
  let playSpy: jasmine.Spy;

  const SRC = 'https://stream.example/live/master.m3u8';

  beforeEach(() => {
    FakeHls.supported = true;
    FakeHls.instances = [];
    loader = jasmine.createSpy('loader').and.resolveTo(FakeHls as unknown as HlsConstructor);
    canPlayType = spyOn(HTMLMediaElement.prototype, 'canPlayType').and.returnValue('');
    playSpy = spyOn(HTMLMediaElement.prototype, 'play').and.resolveTo();

    TestBed.configureTestingModule({ providers: [{ provide: HLS_LOADER, useValue: loader }] });
    fixture = TestBed.createComponent(HlsPlayerComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('src', SRC);
    fixture.componentRef.setInput('title', 'Fight Night en vivo');
    fixture.componentRef.setInput('poster', 'assets/video/poster.webp');
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  const video = (): HTMLVideoElement => element.querySelector('video')!;

  it('en reposo no debe descargar hls.js ni el stream', () => {
    expect(loader).not.toHaveBeenCalled();
    expect(video().getAttribute('preload')).toBe('none');
    expect(video().getAttribute('poster')).toBe('assets/video/poster.webp');
    expect(element.querySelector('.player__start')?.getAttribute('aria-label')).toBe('Ver en vivo: Fight Night en vivo');
  });

  it('en Safari debe usar HLS nativo sin cargar hls.js', async () => {
    canPlayType.and.returnValue('maybe');

    await component.play();
    fixture.detectChanges();

    expect(loader).not.toHaveBeenCalled();
    expect(video().src).toBe(SRC);
    expect(component.state()).toBe('playing');
    expect(video().controls).toBeTrue();
  });

  it('en otros navegadores debe cargar hls.js bajo demanda con worker y adjuntar el stream', async () => {
    element.querySelector<HTMLButtonElement>('.player__start')!.click();
    expect(component.state()).toBe('loading');
    fixture.detectChanges();
    expect(element.querySelector('[role="status"]')?.textContent).toContain('Conectando');

    for (let i = 0; i < 10 && component.state() === 'loading'; i++) {
      await new Promise((resolve) => setTimeout(resolve));
    }

    const [hls] = FakeHls.instances;
    expect(loader).toHaveBeenCalledTimes(1);
    expect(hls.config).toEqual(jasmine.objectContaining({ enableWorker: true }));
    expect(hls.loadSource).toHaveBeenCalledWith(SRC);
    expect(hls.attachMedia).toHaveBeenCalledWith(video());
    expect(component.state()).toBe('playing');
  });

  it('un error fatal de hls.js debe mostrar el aviso; uno no fatal no', async () => {
    await component.play();
    const onError = FakeHls.instances[0].handlers.get('hlsError')!;

    onError('hlsError', { fatal: false });
    expect(component.state()).toBe('playing');

    onError('hlsError', { fatal: true });
    fixture.detectChanges();
    expect(component.state()).toBe('error');
    expect(element.querySelector('[role="alert"]')?.textContent).toContain('No se pudo cargar');
  });

  it('si el navegador no soporta MSE debe mostrar error', async () => {
    FakeHls.supported = false;

    await component.play();

    expect(component.state()).toBe('error');
    expect(playSpy).not.toHaveBeenCalled();
  });

  it('si falla la carga o la reproducción debe mostrar error', async () => {
    playSpy.and.rejectWith(new DOMException('NotAllowedError'));

    await component.play();

    expect(component.state()).toBe('error');
  });

  it('debe ignorar clics repetidos mientras carga', async () => {
    const first = component.play();
    await component.play();
    await first;

    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('debe liberar hls.js al destruirse', async () => {
    await component.play();

    fixture.destroy();

    expect(FakeHls.instances[0].destroy).toHaveBeenCalled();
  });

  it('destruirse sin haber reproducido no debe fallar', () => {
    expect(() => fixture.destroy()).not.toThrow();
  });
});

describe('HLS_LOADER por defecto', () => {
  it('debe cargar hls.js de forma diferida', async () => {
    const Hls = await TestBed.inject(HLS_LOADER)();

    expect(typeof Hls.isSupported).toBe('function');
    expect(Hls.Events.ERROR).toBeDefined();
  });
});
