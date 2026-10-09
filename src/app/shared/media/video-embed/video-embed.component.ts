import { ChangeDetectionStrategy, Component, DOCUMENT, computed, inject, input, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export type EmbedProvider = 'youtube' | 'twitch-channel' | 'twitch-video';

/** Formatos válidos por proveedor: se valida antes de construir la URL del iframe (evita inyección). */
export const EMBED_ID_PATTERNS: Record<EmbedProvider, RegExp> = {
  youtube: /^[\w-]{11}$/,
  'twitch-channel': /^\w{3,25}$/,
  'twitch-video': /^\d{6,12}$/
};

export const buildEmbedUrl = (provider: EmbedProvider, id: string, parentHost: string): string | null => {
  if (!EMBED_ID_PATTERNS[provider].test(id)) {
    return null;
  }
  switch (provider) {
    case 'youtube':
      return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
    case 'twitch-channel':
      return `https://player.twitch.tv/?channel=${id}&parent=${encodeURIComponent(parentHost)}&autoplay=true`;
    case 'twitch-video':
      return `https://player.twitch.tv/?video=v${id}&parent=${encodeURIComponent(parentHost)}&autoplay=true`;
  }
};

/**
 * Fachada de video (patrón "lite embed"): muestra una miniatura y solo carga el iframe del proveedor
 * al pulsar play. Evita ~500 kB de JS de terceros y >1 s de bloqueo del hilo principal por embed.
 */
@Component({
  selector: 'app-video-embed',
  templateUrl: './video-embed.component.html',
  styleUrl: './video-embed.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VideoEmbedComponent {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly document = inject(DOCUMENT);

  readonly provider = input.required<EmbedProvider>();
  readonly videoId = input.required<string>();
  /** Título accesible del video (obligatorio para el botón y el iframe). */
  readonly title = input.required<string>();
  /** Miniatura propia; en YouTube se usa la oficial si no se indica. */
  readonly poster = input<string>();

  readonly activated = signal(false);

  readonly thumbnail = computed(
    () => this.poster() ?? (this.provider() === 'youtube' ? `https://i.ytimg.com/vi/${this.videoId()}/hqdefault.jpg` : null)
  );

  readonly embedUrl = computed<SafeResourceUrl | null>(() => {
    const url = buildEmbedUrl(this.provider(), this.videoId(), this.document.location.hostname);
    // La URL se construye a partir de un ID validado y un origen fijo: es seguro marcarla como confiable.
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  });

  activate(): void {
    this.activated.set(true);
  }
}
