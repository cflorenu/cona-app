import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  InjectionToken,
  inject,
  input,
  signal,
  viewChild
} from '@angular/core';

/** Subconjunto de la API de hls.js que usa el reproductor (permite sustituirlo en tests). */
export interface HlsInstance {
  loadSource(src: string): void;
  attachMedia(media: HTMLMediaElement): void;
  on(event: string, handler: (event: string, data: { fatal?: boolean }) => void): void;
  destroy(): void;
}

export interface HlsConstructor {
  new (config?: Record<string, unknown>): HlsInstance;
  isSupported(): boolean;
  readonly Events: { ERROR: string };
}

/** Carga diferida de hls.js: el chunk (~150 kB gzip) solo se descarga cuando el usuario pulsa play. */
export const HLS_LOADER = new InjectionToken<() => Promise<HlsConstructor>>('HLS_LOADER', {
  providedIn: 'root',
  factory: () => () => import('hls.js').then((m) => m.default as unknown as HlsConstructor)
});

export type PlayerState = 'idle' | 'loading' | 'playing' | 'error';

@Component({
  selector: 'app-hls-player',
  templateUrl: './hls-player.component.html',
  styleUrl: './hls-player.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HlsPlayerComponent {
  private readonly loadHls = inject(HLS_LOADER);
  private readonly video = viewChild.required<ElementRef<HTMLVideoElement>>('video');
  private hls?: HlsInstance;

  /** URL del manifiesto .m3u8 */
  readonly src = input.required<string>();
  readonly title = input.required<string>();
  readonly poster = input<string>();

  readonly state = signal<PlayerState>('idle');

  constructor() {
    inject(DestroyRef).onDestroy(() => this.hls?.destroy());
  }

  async play(): Promise<void> {
    if (this.state() !== 'idle') {
      return;
    }
    const video = this.video().nativeElement;
    this.state.set('loading');

    try {
      // Safari (iOS/macOS) reproduce HLS de forma nativa: no hace falta descargar hls.js.
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = this.src();
      } else {
        const Hls = await this.loadHls();
        if (!Hls.isSupported()) {
          this.state.set('error');
          return;
        }
        // enableWorker: el transmuxing corre en un Web Worker, fuera del hilo principal.
        this.hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        this.hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            this.state.set('error');
          }
        });
        this.hls.loadSource(this.src());
        this.hls.attachMedia(video);
      }
      await video.play();
      this.state.set('playing');
    } catch {
      this.state.set('error');
    }
  }
}
