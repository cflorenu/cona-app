import { Directive, ElementRef, OnDestroy, afterNextRender, inject } from '@angular/core';

export const VISIBILITY_THRESHOLD = 0.25;

/**
 * Reproduce un <video> silenciado solo mientras es visible, para no descargar videos pesados
 * que el usuario no llega a ver. Respeta prefers-reduced-motion y solo se ejecuta en el navegador.
 */
@Directive({
  selector: 'video[appPlayWhenVisible]',
  standalone: true
})
export class PlayWhenVisibleDirective implements OnDestroy {
  private readonly video: HTMLVideoElement = inject(ElementRef).nativeElement;
  private observer?: IntersectionObserver;

  constructor() {
    afterNextRender(() => this.init());
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private init(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    if (typeof IntersectionObserver === 'undefined') {
      this.play();
      return;
    }
    this.observer = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? this.play() : this.video.pause()),
      { threshold: VISIBILITY_THRESHOLD }
    );
    this.observer.observe(this.video);
  }

  private play(): void {
    this.video.muted = true;
    this.video.play().catch(() => {
      // El navegador bloqueó la reproducción automática: el video queda en pausa sin romper la página.
    });
  }
}
