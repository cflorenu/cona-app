import { Component, DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DISPLAY_FONT_URL, preloadFont } from './font-preload';

@Component({ template: '' })
class PageComponent {
  constructor() {
    preloadFont();
  }
}

describe('preloadFont', () => {
  const links = (): HTMLLinkElement[] =>
    Array.from(TestBed.inject(DOCUMENT).head.querySelectorAll<HTMLLinkElement>(`link[rel="preload"][href="${DISPLAY_FONT_URL}"]`));

  it('debe añadir un <link rel="preload"> de la fuente con crossorigin y retirarlo al salir', () => {
    const fixture = TestBed.createComponent(PageComponent);

    const [link] = links();
    expect(link.as).toBe('font');
    expect(link.type).toBe('font/woff2');
    expect(link.crossOrigin).toBe('anonymous');

    fixture.destroy();
    expect(links()).toHaveSize(0);
  });

  it('no debe duplicar la precarga si ya existe', () => {
    const first = TestBed.createComponent(PageComponent);
    const second = TestBed.createComponent(PageComponent);

    expect(links()).toHaveSize(1);

    second.destroy();
    first.destroy();
    expect(links()).toHaveSize(0);
  });
});
