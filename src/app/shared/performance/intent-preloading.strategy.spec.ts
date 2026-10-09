import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Route } from '@angular/router';
import { of } from 'rxjs';
import { IntentPreloadingStrategy, PrefetchDirective } from './intent-preloading.strategy';

describe('IntentPreloadingStrategy', () => {
  let strategy: IntentPreloadingStrategy;
  let loads: string[];

  const preload = (path: string): void => {
    strategy.preload({ path } as Route, () => {
      loads.push(path);
      return of(path);
    }).subscribe();
  };

  beforeEach(() => {
    strategy = TestBed.inject(IntentPreloadingStrategy);
    loads = [];
  });

  it('no debe precargar nada sin intención del usuario', () => {
    preload('blog');
    preload('biography');

    expect(loads).toEqual([]);
  });

  it('debe precargar solo la ruta solicitada (normalizando barras, query y fragmento)', () => {
    preload('blog');
    preload('biography');

    strategy.request('/blog/?ref=nav#top');

    expect(loads).toEqual(['blog']);
  });

  it('debe precargar una sola vez aunque la intención se repita', () => {
    preload('blog');

    strategy.request('/blog');
    strategy.request('/blog');

    expect(loads).toEqual(['blog']);
  });

  it('si la intención llegó antes de que el router consulte la ruta, precarga de inmediato', () => {
    strategy.request('/clase-privada');

    preload('clase-privada');

    expect(loads).toEqual(['clase-privada']);
  });

  it('la ruta raíz (path vacío) también se puede precargar', () => {
    preload('');
    strategy.request('/');

    expect(loads).toEqual(['']);
  });

  it('una ruta sin path (matcher) solo se precarga con intención explícita de la raíz', () => {
    strategy.preload({} as Route, () => {
      loads.push('matcher');
      return of(null);
    }).subscribe();

    strategy.request('/');

    expect(loads).toEqual(['matcher']);
  });

  it('con "Ahorro de datos" activo no debe precargar', () => {
    spyOnProperty(Navigator.prototype, 'connection' as keyof Navigator).and.returnValue({ saveData: true } as never);
    preload('blog');

    strategy.request('/blog');

    expect(loads).toEqual([]);
  });

  it('en navegadores sin Network Information API debe precargar', () => {
    spyOnProperty(Navigator.prototype, 'connection' as keyof Navigator).and.returnValue(undefined as never);
    preload('blog');

    strategy.request('/blog');

    expect(loads).toEqual(['blog']);
  });
});

describe('PrefetchDirective', () => {
  @Component({
    imports: [PrefetchDirective],
    template: `<a href="/blog" appPrefetch="/blog">Blog</a>`
  })
  class HostComponent {}

  it('hover, foco o toque deben solicitar la precarga de la ruta', () => {
    const strategy = TestBed.inject(IntentPreloadingStrategy);
    const request = spyOn(strategy, 'request');
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a');

    link.dispatchEvent(new MouseEvent('mouseenter'));
    link.dispatchEvent(new FocusEvent('focus'));
    link.dispatchEvent(new Event('touchstart'));

    expect(request.calls.allArgs()).toEqual([['/blog'], ['/blog'], ['/blog']]);
  });
});
