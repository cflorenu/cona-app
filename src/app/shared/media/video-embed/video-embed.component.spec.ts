import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmbedProvider, VideoEmbedComponent, buildEmbedUrl } from './video-embed.component';

describe('VideoEmbedComponent (fachada)', () => {
  let fixture: ComponentFixture<VideoEmbedComponent>;
  let element: HTMLElement;

  const render = (provider: EmbedProvider, videoId: string, poster?: string): void => {
    fixture = TestBed.createComponent(VideoEmbedComponent);
    fixture.componentRef.setInput('provider', provider);
    fixture.componentRef.setInput('videoId', videoId);
    fixture.componentRef.setInput('title', 'Final de lucha');
    if (poster) {
      fixture.componentRef.setInput('poster', poster);
    }
    fixture.detectChanges();
    element = fixture.nativeElement;
  };
  const activate = (): void => {
    element.querySelector<HTMLButtonElement>('.embed__facade')!.click();
    fixture.detectChanges();
  };

  describe('buildEmbedUrl', () => {
    it('debe construir URLs de YouTube (sin cookies) y Twitch con el parent obligatorio', () => {
      expect(buildEmbedUrl('youtube', 'dQw4w9WgXcQ', 'x')).toBe(
        'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0&modestbranding=1'
      );
      expect(buildEmbedUrl('twitch-channel', 'conatletas', 'www.ejemplo.pe')).toBe(
        'https://player.twitch.tv/?channel=conatletas&parent=www.ejemplo.pe&autoplay=true'
      );
      expect(buildEmbedUrl('twitch-video', '123456789', 'localhost')).toBe(
        'https://player.twitch.tv/?video=v123456789&parent=localhost&autoplay=true'
      );
    });

    it('debe rechazar IDs con formato inválido (evita inyectar parámetros o HTML en la URL)', () => {
      expect(buildEmbedUrl('youtube', 'abc"><script>', 'x')).toBeNull();
      expect(buildEmbedUrl('youtube', 'dQw4w9WgXcQ&autoplay=0', 'x')).toBeNull();
      expect(buildEmbedUrl('twitch-channel', 'canal/../../evil', 'x')).toBeNull();
      expect(buildEmbedUrl('twitch-video', 'v12345', 'x')).toBeNull();
    });
  });

  it('no debe cargar el iframe hasta que el usuario pulse play', () => {
    render('youtube', 'dQw4w9WgXcQ');

    expect(element.querySelector('iframe')).toBeNull();
    const button = element.querySelector('.embed__facade')!;
    expect(button.getAttribute('aria-label')).toBe('Reproducir: Final de lucha');
    expect(element.querySelector('img')?.getAttribute('src')).toBe('https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
    expect(element.querySelector('img')?.getAttribute('loading')).toBe('lazy');
  });

  it('al pulsar play debe insertar el iframe de YouTube con título y permisos', () => {
    render('youtube', 'dQw4w9WgXcQ');
    activate();

    const iframe = element.querySelector('iframe')!;
    expect(iframe.src).toContain('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
    expect(iframe.title).toBe('Final de lucha');
    expect(iframe.getAttribute('allow')).toContain('autoplay');
    expect(element.querySelector('.embed__facade')).toBeNull();
  });

  it('una miniatura propia debe tener prioridad sobre la de YouTube', () => {
    render('youtube', 'dQw4w9WgXcQ', 'assets/video/poster.webp');
    expect(element.querySelector('img')?.getAttribute('src')).toBe('assets/video/poster.webp');
  });

  it('Twitch sin poster no debe mostrar miniatura y debe usar el dominio actual como parent', () => {
    render('twitch-channel', 'conatletas');
    expect(element.querySelector('img')).toBeNull();

    activate();

    expect(element.querySelector('iframe')!.src).toContain(`parent=${location.hostname}`);
  });

  it('con un ID inválido debe mostrar un aviso en lugar del reproductor', () => {
    render('twitch-video', 'no-es-un-id');

    expect(element.querySelector('.embed')).toBeNull();
    expect(element.querySelector('[role="alert"]')?.textContent).toContain('Video no disponible');
  });
});
