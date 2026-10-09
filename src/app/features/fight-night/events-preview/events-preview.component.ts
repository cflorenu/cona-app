import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { JsonLdService } from '../../../shared/seo/json-ld.service';
import { preloadFont } from '../../../shared/performance/font-preload';
import { buildPersonJsonLd, buildSportsEventJsonLd } from '../../../shared/seo/structured-data';
import { HlsPlayerComponent } from '../../../shared/media/hls-player/hls-player.component';
import { DEMO_EVENT, DEMO_FIGHTERS, DEMO_PREDICTIONS, DEMO_STREAM } from '../data/demo-event';
import { EventCountdownComponent } from '../event-countdown/event-countdown.component';
import { FighterProfileCardComponent } from '../fighter-profile-card/fighter-profile-card.component';
import { LiveTickerComponent } from '../live/live-ticker.component';
import { MatchCardComponent } from '../match-card/match-card.component';
import { Corner, PredictionTally } from '../models';

export type Theme = 'dark' | 'light';

const capitalize = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);

const dateFormatter = new Intl.DateTimeFormat('es-PE', {
  dateStyle: 'full',
  timeStyle: 'short',
  timeZone: 'America/Lima'
});

@Component({
  selector: 'app-events-preview',
  imports: [EventCountdownComponent, MatchCardComponent, FighterProfileCardComponent, HlsPlayerComponent, LiveTickerComponent],
  templateUrl: './events-preview.component.html',
  styleUrl: './events-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventsPreviewComponent {
  readonly event = DEMO_EVENT;
  readonly fighters = DEMO_FIGHTERS;
  readonly stream = DEMO_STREAM;
  readonly liveFeedUrl = environment.liveFeedUrl;
  readonly formattedDate = capitalize(dateFormatter.format(new Date(this.event.startDate)));
  /** Main event primero, como en una cartelera de PPV. */
  readonly card = [...this.event.matches].sort((a, b) => Number(b.isMainEvent) - Number(a.isMainEvent));

  readonly theme = signal<Theme>('dark');
  readonly predictions = signal<Record<string, PredictionTally>>({ ...DEMO_PREDICTIONS });
  readonly picks = signal<Partial<Record<string, Corner>>>({});
  readonly isStarted = signal(false);
  readonly nextTheme = computed<Theme>(() => (this.theme() === 'dark' ? 'light' : 'dark'));

  constructor() {
    preloadFont();
    const jsonLd = inject(JsonLdService);
    jsonLd.set('event', buildSportsEventJsonLd(this.event, environment.siteUrl));
    jsonLd.set('roster', this.fighters.map((f) => buildPersonJsonLd(f, environment.siteUrl)));
    inject(DestroyRef).onDestroy(() => {
      jsonLd.remove('event');
      jsonLd.remove('roster');
    });
  }

  toggleTheme(): void {
    this.theme.set(this.nextTheme());
  }

  /** Un voto por combate; cambiar de esquina mueve el voto. En producción esto iría a una API con rate limiting. */
  vote(matchId: string, corner: Corner): void {
    const previous = this.picks()[matchId];
    if (previous === corner) {
      return;
    }
    this.predictions.update((all) => {
      const tally = { ...all[matchId] };
      tally[corner] += 1;
      if (previous) {
        tally[previous] -= 1;
      }
      return { ...all, [matchId]: tally };
    });
    this.picks.update((all) => ({ ...all, [matchId]: corner }));
  }

  onStarted(): void {
    this.isStarted.set(true);
  }
}
