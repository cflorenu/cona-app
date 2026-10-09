import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BiographyComponent } from './biography.component';

describe('BiographyComponent', () => {
  let fixture: ComponentFixture<BiographyComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [BiographyComponent] }).compileComponents();

    fixture = TestBed.createComponent(BiographyComponent);
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('debe crearse', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('todas las imágenes deben tener texto alternativo, ruta a assets y carga diferida', () => {
    const imgs = Array.from(element.querySelectorAll<HTMLImageElement>('img'));

    expect(imgs.length).toBeGreaterThan(0);
    imgs.forEach((img) => {
      expect(img.alt).withContext(img.src).toBeTruthy();
      expect(img.getAttribute('src')).toMatch(/^assets\//);
      expect(img.getAttribute('loading')).toBe('lazy');
    });
  });

  it('debe tener un único h1 en la página', () => {
    expect(element.querySelectorAll('h1')).toHaveSize(1);
  });

  it('todas las imágenes deben declarar dimensiones o usar modo fill (evita CLS)', () => {
    element.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
      const hasDims = img.hasAttribute('width') && img.hasAttribute('height');
      const isFill = img.style.position === 'absolute';
      expect(hasDims || isFill).withContext(img.getAttribute('src')!).toBeTrue();
    });
  });
});
