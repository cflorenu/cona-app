import { EventSourceLike } from '../live/live-feed.service';

/** EventSource simulado para tests del feed en vivo. */
export class FakeEventSource implements EventSourceLike {
  readyState = 0;
  onopen: ((event: Event) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  readonly listeners = new Map<string, (event: MessageEvent<string>) => void>();
  readonly close = jasmine.createSpy('close');

  constructor(readonly url: string) {}

  addEventListener(type: string, listener: (event: MessageEvent<string>) => void): void {
    this.listeners.set(type, listener);
  }

  emit(data: unknown): void {
    const raw = typeof data === 'string' ? data : JSON.stringify(data);
    this.listeners.get('update')!(new MessageEvent('update', { data: raw }));
  }
}
