import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayWhenVisibleDirective, VISIBILITY_THRESHOLD } from './play-when-visible.directive';

@Component({
    imports: [PlayWhenVisibleDirective],
    template: `<video appPlayWhenVisible loop playsinline preload="none"></video>`
})
class HostComponent {}

class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  readonly observe = jasmine.createSpy('observe');
  readonly disconnect = jasmine.createSpy('disconnect');

  constructor(
    readonly callback: IntersectionObserverCallback,
    readonly options?: IntersectionObserverInit
  ) {
    FakeIntersectionObserver.instances.push(this);
  }

  emit(isIntersecting: boolean): void {
    this.callback([{ isIntersecting } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }
}

describe('PlayWhenVisibleDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let video: HTMLVideoElement;
  let playSpy: jasmine.Spy;
  let pauseSpy: jasmine.Spy;
  let reducedMotion: boolean;
  const originalObserver = window.IntersectionObserver;

  const render = (): void => {
    fixture = TestBed.createComponent(HostComponent);
    video = fixture.nativeElement.querySelector('video');
    fixture.detectChanges();
  };
  const observer = (): FakeIntersectionObserver => FakeIntersectionObserver.instances[0];

  beforeEach(() => {
    FakeIntersectionObserver.instances = [];
    reducedMotion = false;
    (window as { IntersectionObserver: unknown }).IntersectionObserver = FakeIntersectionObserver;
    spyOn(window, 'matchMedia').and.callFake((query: string) => ({ matches: reducedMotion, media: query }) as MediaQueryList);
    playSpy = spyOn(HTMLMediaElement.prototype, 'play').and.returnValue(Promise.resolve());
    pauseSpy = spyOn(HTMLMediaElement.prototype, 'pause');
  });

  afterEach(() => {
    window.IntersectionObserver = originalObserver;
  });

  it('no debe reproducir ni descargar el video antes de ser visible', () => {
    render();

    expect(observer().observe).toHaveBeenCalledOnceWith(video);
    expect(observer().options).toEqual({ threshold: VISIBILITY_THRESHOLD });
    expect(playSpy).not.toHaveBeenCalled();
  });

  it('debe reproducir silenciado al entrar en el viewport', () => {
    render();
    video.muted = false;

    observer().emit(true);

    expect(playSpy).toHaveBeenCalledTimes(1);
    expect(video.muted).toBeTrue();
  });

  it('debe pausar al salir del viewport', () => {
    render();

    observer().emit(false);

    expect(pauseSpy).toHaveBeenCalledTimes(1);
    expect(playSpy).not.toHaveBeenCalled();
  });

  it('no debe reproducir si el usuario prefiere movimiento reducido', () => {
    reducedMotion = true;
    render();

    expect(window.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
    expect(FakeIntersectionObserver.instances).toHaveSize(0);
    expect(playSpy).not.toHaveBeenCalled();
  });

  it('sin IntersectionObserver debe reproducir directamente (degradación elegante)', () => {
    (window as { IntersectionObserver: unknown }).IntersectionObserver = undefined;
    render();

    expect(playSpy).toHaveBeenCalledTimes(1);
  });

  it('debe tolerar que el navegador bloquee la reproducción automática', async () => {
    const rejected = Promise.reject(new DOMException('NotAllowedError'));
    const catchSpy = spyOn(rejected, 'catch').and.callThrough();
    playSpy.and.returnValue(rejected);
    render();

    observer().emit(true);
    await Promise.resolve();

    // El rechazo se captura (sin "unhandled rejection") y la página sigue funcionando.
    expect(catchSpy).toHaveBeenCalled();
  });

  it('debe desconectar el observer al destruirse', () => {
    render();

    fixture.destroy();

    expect(observer().disconnect).toHaveBeenCalled();
  });

  it('destruirse sin observer (movimiento reducido) no debe fallar', () => {
    reducedMotion = true;
    render();

    expect(() => fixture.destroy()).not.toThrow();
  });
});
