import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { OPTIMIZED_IMAGE } from './explicit-sizes.directive';
import { provideOptimizedImages } from './image-loader';

@Component({
  imports: [OPTIMIZED_IMAGE],
  template: `
    <div style="position: relative; height: 100px">
      <img id="lazy" ngSrc="assets/sambo.jpg" fill sizes="(min-width: 768px) 50vw, 100vw" alt="lazy">
    </div>
    <img id="eager" ngSrc="assets/jiu-jitsu.jpg" width="1280" height="720" sizes="100vw" priority alt="eager">
  `
})
class HostComponent {}

describe('ExplicitSizesDirective', () => {
  let element: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: provideOptimizedImages() });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  it('en imágenes lazy debe quitar el prefijo "auto, " (evita la doble descarga en Chrome)', () => {
    const img = element.querySelector('#lazy')!;

    expect(img.getAttribute('loading')).toBe('lazy');
    expect(img.getAttribute('sizes')).toBe('(min-width: 768px) 50vw, 100vw');
    expect(img.getAttribute('srcset')).toContain('sambo-640.webp 640w');
  });

  it('en imágenes prioritarias debe conservar el sizes declarado', () => {
    const img = element.querySelector('#eager')!;

    expect(img.getAttribute('loading')).toBe('eager');
    expect(img.getAttribute('sizes')).toBe('100vw');
  });
});
