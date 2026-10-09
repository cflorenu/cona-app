import { isPlatformBrowser } from '@angular/common';
import { Injectable, InjectionToken, PLATFORM_ID, Signal, inject, signal } from '@angular/core';

export interface LiveUpdate {
  id: string;
  matchId: string;
  kind: 'info' | 'score' | 'result';
  text: string;
  round?: number;
  time?: string;
}

export type FeedStatus = 'connecting' | 'open' | 'reconnecting' | 'closed';

export interface LiveFeed {
  readonly updates: Signal<readonly LiveUpdate[]>;
  readonly status: Signal<FeedStatus>;
  close(): void;
}

/** Subconjunto de EventSource usado por el servicio (sustituible en tests). */
export interface EventSourceLike {
  readonly readyState: number;
  onopen: ((event: Event) => void) | null;
  onerror: ((event: Event) => void) | null;
  addEventListener(type: string, listener: (event: MessageEvent<string>) => void): void;
  close(): void;
}

export const EVENT_SOURCE_FACTORY = new InjectionToken<(url: string) => EventSourceLike>('EVENT_SOURCE_FACTORY', {
  providedIn: 'root',
  factory: () => (url: string) => new EventSource(url)
});

export const MAX_UPDATES = 50;
const EVENT_SOURCE_CLOSED = 2;
const KINDS = new Set(['info', 'score', 'result']);

/** Valida el mensaje recibido: el feed es una entrada externa y no se confía en su forma. */
export const isLiveUpdate = (value: unknown): value is LiveUpdate => {
  const v = value as Partial<LiveUpdate> | null;
  return (
    typeof v === 'object' &&
    v !== null &&
    typeof v.id === 'string' &&
    typeof v.matchId === 'string' &&
    typeof v.text === 'string' &&
    KINDS.has(v.kind as string) &&
    (v.round === undefined || typeof v.round === 'number') &&
    (v.time === undefined || typeof v.time === 'string')
  );
};

const parse = (raw: string): unknown => {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

/**
 * Resultados en vivo por Server-Sent Events. Reconexión automática nativa de EventSource;
 * en el prerender (servidor) no se conecta. Con la app zoneless, los signals refrescan solo las vistas afectadas.
 */
@Injectable({
  providedIn: 'root'
})
export class LiveFeedService {
  private readonly createSource = inject(EVENT_SOURCE_FACTORY);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  connect(url: string): LiveFeed {
    const updates = signal<readonly LiveUpdate[]>([]);
    const status = signal<FeedStatus>('closed');

    if (!this.isBrowser || !url) {
      return { updates: updates.asReadonly(), status: status.asReadonly(), close: () => undefined };
    }

    status.set('connecting');
    const source = this.createSource(url);
    source.onopen = () => status.set('open');
    source.onerror = () => status.set(source.readyState === EVENT_SOURCE_CLOSED ? 'closed' : 'reconnecting');
    source.addEventListener('update', (event) => {
      const data = parse(event.data);
      if (isLiveUpdate(data)) {
        updates.update((list) => [data, ...list.filter((u) => u.id !== data.id)].slice(0, MAX_UPDATES));
      }
    });

    return {
      updates: updates.asReadonly(),
      status: status.asReadonly(),
      close: () => {
        source.close();
        status.set('closed');
      }
    };
  }
}
