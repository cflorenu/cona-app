import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FakeEventSource } from '../testing/fake-event-source';
import { EVENT_SOURCE_FACTORY, LiveFeedService, LiveUpdate, MAX_UPDATES, isLiveUpdate } from './live-feed.service';

const update = (id: string, overrides: Partial<LiveUpdate> = {}): LiveUpdate => ({
  id,
  matchId: 'm1',
  kind: 'info',
  text: `Actualización ${id}`,
  round: 1,
  time: '4:00',
  ...overrides
});

describe('LiveFeedService', () => {
  let sources: FakeEventSource[];

  beforeEach(() => {
    sources = [];
    TestBed.configureTestingModule({
      providers: [
        {
          provide: EVENT_SOURCE_FACTORY,
          useValue: (url: string) => {
            const source = new FakeEventSource(url);
            sources.push(source);
            return source;
          }
        }
      ]
    });
  });

  describe('isLiveUpdate', () => {
    it('debe aceptar actualizaciones bien formadas (round y time opcionales)', () => {
      expect(isLiveUpdate(update('1'))).toBeTrue();
      expect(isLiveUpdate({ id: '2', matchId: 'm1', kind: 'result', text: 'Final' })).toBeTrue();
    });

    it('debe rechazar mensajes con forma o tipos inválidos', () => {
      expect(isLiveUpdate(null)).toBeFalse();
      expect(isLiveUpdate('texto')).toBeFalse();
      expect(isLiveUpdate({ ...update('1'), kind: 'hack' })).toBeFalse();
      expect(isLiveUpdate({ ...update('1'), text: 42 })).toBeFalse();
      expect(isLiveUpdate({ ...update('1'), round: '1' })).toBeFalse();
      expect(isLiveUpdate({ ...update('1'), time: 300 })).toBeFalse();
      expect(isLiveUpdate({ ...update('1'), id: undefined })).toBeFalse();
      expect(isLiveUpdate({ ...update('1'), matchId: 1 })).toBeFalse();
    });
  });

  it('debe conectarse a la URL y reflejar el estado de la conexión', () => {
    const feed = TestBed.inject(LiveFeedService).connect('https://api.example/live');
    const [source] = sources;

    expect(source.url).toBe('https://api.example/live');
    expect(feed.status()).toBe('connecting');

    source.onopen!(new Event('open'));
    expect(feed.status()).toBe('open');

    source.readyState = 0;
    source.onerror!(new Event('error'));
    expect(feed.status()).toBe('reconnecting');

    source.readyState = 2;
    source.onerror!(new Event('error'));
    expect(feed.status()).toBe('closed');
  });

  it('debe añadir actualizaciones (más reciente primero) sin duplicar ids', () => {
    const feed = TestBed.inject(LiveFeedService).connect('/live');
    const [source] = sources;

    source.emit(update('a'));
    source.emit(update('b'));
    source.emit(update('a', { text: 'corregida' }));

    expect(feed.updates().map((u) => u.id)).toEqual(['a', 'b']);
    expect(feed.updates()[0].text).toBe('corregida');
  });

  it('debe descartar mensajes malformados o maliciosos', () => {
    const feed = TestBed.inject(LiveFeedService).connect('/live');
    const [source] = sources;

    source.emit('{no es json');
    source.emit({ id: 'x', text: '<img src=x onerror=alert(1)>' });

    expect(feed.updates()).toEqual([]);
  });

  it(`debe conservar como máximo ${MAX_UPDATES} actualizaciones`, () => {
    const feed = TestBed.inject(LiveFeedService).connect('/live');
    const [source] = sources;

    for (let i = 0; i < MAX_UPDATES + 5; i++) {
      source.emit(update(String(i)));
    }

    expect(feed.updates()).toHaveSize(MAX_UPDATES);
    expect(feed.updates()[0].id).toBe(String(MAX_UPDATES + 4));
  });

  it('close debe cerrar la conexión', () => {
    const feed = TestBed.inject(LiveFeedService).connect('/live');

    feed.close();

    expect(sources[0].close).toHaveBeenCalled();
    expect(feed.status()).toBe('closed');
  });

  it('sin URL configurada no debe conectarse', () => {
    const feed = TestBed.inject(LiveFeedService).connect('');

    expect(sources).toHaveSize(0);
    expect(feed.status()).toBe('closed');
    expect(() => feed.close()).not.toThrow();
  });

  it('en el servidor (prerender) no debe conectarse', () => {
    TestBed.overrideProvider(PLATFORM_ID, { useValue: 'server' });

    const feed = TestBed.inject(LiveFeedService).connect('/live');

    expect(sources).toHaveSize(0);
    expect(feed.status()).toBe('closed');
  });
});

describe('EVENT_SOURCE_FACTORY por defecto', () => {
  it('debe crear un EventSource nativo', () => {
    const source = TestBed.inject(EVENT_SOURCE_FACTORY)('/sse-test');

    expect(source).toBeInstanceOf(EventSource);
    source.close();
  });
});
