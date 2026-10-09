import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { appConfig } from './app.config';
import { routes } from './app.routes';

describe('appConfig', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: appConfig.providers }));

  it('debe registrar el router con las rutas de la aplicación', () => {
    expect(TestBed.inject(Router).config).toEqual(routes);
  });

  it('debe proveer HttpClient', () => {
    expect(TestBed.inject(HttpClient)).toBeTruthy();
  });
});
