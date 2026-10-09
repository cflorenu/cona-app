import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { IMAGE_WIDTHS } from './image-manifest';
import { optimizedImageLoader, provideOptimizedImages } from './image-loader';

describe('optimizedImageLoader', () => {
  it('debe elegir la variante más pequeña que cubra el ancho pedido', () => {
    expect(optimizedImageLoader({ src: 'assets/sambo.jpg', width: 500 })).toBe('assets/optimized/sambo-640.webp');
    expect(optimizedImageLoader({ src: 'assets/sambo.jpg', width: 640 })).toBe('assets/optimized/sambo-640.webp');
  });

  it('nunca amplía: por encima del original devuelve la variante más grande', () => {
    expect(optimizedImageLoader({ src: 'assets/paul1.jpg', width: 1920 })).toBe('assets/optimized/paul1-540.webp');
  });

  it('sin ancho (atributo src de respaldo) devuelve la variante más grande', () => {
    expect(optimizedImageLoader({ src: '/assets/boxeo.webp' })).toBe('assets/optimized/boxeo-1920.webp');
  });

  it('debe devolver el original para SVG, imágenes externas o sin variantes generadas', () => {
    expect(optimizedImageLoader({ src: 'assets/fighters/placeholder.svg', width: 400 })).toBe('assets/fighters/placeholder.svg');
    expect(optimizedImageLoader({ src: 'https://cdn.example/x.jpg', width: 400 })).toBe('https://cdn.example/x.jpg');
    expect(optimizedImageLoader({ src: 'assets/no-existe.jpg', width: 400 })).toBe('assets/no-existe.jpg');
  });

  it('el manifiesto debe tener anchos ascendentes para cada imagen', () => {
    Object.entries(IMAGE_WIDTHS).forEach(([name, widths]) =>
      expect([...widths].sort((a, b) => a - b)).withContext(name).toEqual([...widths])
    );
  });

  it('integrado con NgOptimizedImage debe generar src y srcset con variantes WebP', () => {
    @Component({
      imports: [NgOptimizedImage],
      template: `<img ngSrc="assets/jiu-jitsu.jpg" width="1280" height="720" sizes="50vw" alt="x">`
    })
    class HostComponent {}

    TestBed.configureTestingModule({ providers: provideOptimizedImages() });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const img: HTMLImageElement = fixture.nativeElement.querySelector('img');

    expect(img.getAttribute('src')).toBe('assets/optimized/jiu-jitsu-1280.webp');
    expect(img.getAttribute('srcset')).toContain('assets/optimized/jiu-jitsu-320.webp 320w');
    expect(img.getAttribute('srcset')).toContain('assets/optimized/jiu-jitsu-640.webp 640w');
  });
});
