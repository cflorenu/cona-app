import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BlogComponent } from './blog.component';

describe('BlogComponent', () => {
  let fixture: ComponentFixture<BlogComponent>;
  let component: BlogComponent;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [BlogComponent] }).compileComponents();

    fixture = TestBed.createComponent(BlogComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('debe renderizar una tarjeta por noticia', () => {
    const cards = element.querySelectorAll('.card');

    expect(cards).toHaveSize(component.noticias.length);
    component.noticias.forEach((noticia, i) => {
      expect(cards[i].querySelector('.card-title')?.textContent).toBe(noticia.titulo);
      expect(cards[i].querySelector('.card-text')?.textContent).toBe(noticia.descripcion);
    });
  });

  it('las imágenes deben usar rutas absolutas a assets, alt descriptivo y carga diferida', () => {
    const imgs = Array.from(element.querySelectorAll<HTMLImageElement>('.card img'));

    imgs.forEach((img, i) => {
      expect(img.getAttribute('src')).toMatch(/^assets\//);
      expect(img.alt).toBe(component.noticias[i].titulo);
      expect(img.getAttribute('loading')).toBe('lazy');
    });
  });

  it('los títulos de noticia deben ser únicos (se usan como clave de track)', () => {
    const titles = component.noticias.map((n) => n.titulo);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('debe tener un único h1 en la página', () => {
    expect(element.querySelectorAll('h1')).toHaveSize(1);
  });

  it('el video de fondo: WebM 720p con respaldo MP4, poster, silenciado, sin precarga ni autoplay', () => {
    const video = element.querySelector('video')!;
    const sources = Array.from(video.querySelectorAll('source')).map((s) => [s.getAttribute('src'), s.type]);

    expect(sources).toEqual([
      ['assets/video/paul-sobrado-720.webm', 'video/webm'],
      ['assets/video/paul-sobrado-720.mp4', 'video/mp4']
    ]);
    expect(video.getAttribute('poster')).toBe('assets/video/paul-sobrado-poster.webp');
    expect(video.muted).toBeTrue();
    expect(video.getAttribute('preload')).toBe('none');
    expect(video.hasAttribute('autoplay')).toBeFalse();
    expect(video.hasAttribute('appPlayWhenVisible')).toBeTrue();
  });

  it('todas las imágenes deben declarar dimensiones o usar modo fill (evita CLS)', () => {
    element.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
      const hasDims = img.hasAttribute('width') && img.hasAttribute('height');
      const isFill = img.style.position === 'absolute';
      expect(hasDims || isFill).withContext(img.getAttribute('src')!).toBeTrue();
    });
  });
});
