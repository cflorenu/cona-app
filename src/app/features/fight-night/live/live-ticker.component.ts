import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, input, signal } from '@angular/core';
import { FeedStatus, LiveFeed, LiveFeedService } from './live-feed.service';

export const STATUS_LABELS: Record<FeedStatus, string> = {
  connecting: 'Conectando…',
  open: 'En vivo',
  reconnecting: 'Reconectando…',
  closed: 'Sin conexión'
};

@Component({
  selector: 'app-live-ticker',
  templateUrl: './live-ticker.component.html',
  styleUrl: './live-ticker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LiveTickerComponent implements OnInit {
  private readonly liveFeed = inject(LiveFeedService);
  private readonly destroyRef = inject(DestroyRef);

  /** Endpoint SSE del play-by-play. */
  readonly url = input.required<string>();
  readonly statusLabels = STATUS_LABELS;
  readonly feed = signal<LiveFeed | null>(null);

  ngOnInit(): void {
    const feed = this.liveFeed.connect(this.url());
    this.feed.set(feed);
    this.destroyRef.onDestroy(() => feed.close());
  }
}
