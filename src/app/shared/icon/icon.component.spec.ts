import { TestBed } from '@angular/core/testing';
import { ICON_PATHS, IconComponent, IconName } from './icon.component';

describe('IconComponent', () => {
  const render = (name: IconName): HTMLElement => {
    const fixture = TestBed.createComponent(IconComponent);
    fixture.componentRef.setInput('name', name);
    fixture.detectChanges();
    return fixture.nativeElement;
  };

  (Object.keys(ICON_PATHS) as IconName[]).forEach((name) =>
    it(`debe renderizar el trazado SVG de "${name}"`, () => {
      const path = render(name).querySelector('svg path')!;
      expect(path.getAttribute('d')).toBe(ICON_PATHS[name]);
    })
  );

  it('debe ser decorativo (oculto a lectores de pantalla y no enfocable)', () => {
    const svg = render('whatsapp').querySelector('svg')!;

    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.getAttribute('focusable')).toBe('false');
  });

  it('debe escalar con el font-size y heredar el color del texto', () => {
    const svg = render('tiktok').querySelector('svg')!;

    expect(svg.getAttribute('width')).toBe('1em');
    expect(svg.getAttribute('height')).toBe('1em');
    expect(svg.getAttribute('fill')).toBe('currentColor');
  });

  it('debe actualizar el trazado al cambiar el input', () => {
    const fixture = TestBed.createComponent(IconComponent);
    fixture.componentRef.setInput('name', 'facebook');
    fixture.detectChanges();

    fixture.componentRef.setInput('name', 'linkedin');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('path').getAttribute('d')).toBe(ICON_PATHS.linkedin);
  });
});
