import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Not404Component } from './not404.component';

describe('Not404Component', () => {
  let fixture: ComponentFixture<Not404Component>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Not404Component],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(Not404Component);
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('debe mostrar el mensaje de error 404', () => {
    expect(element.querySelector('h1')?.textContent).toContain('Error 404');
  });

  it('no debe incrustar un documento HTML completo dentro del componente', () => {
    expect(element.querySelector('html, head, body, title')).toBeNull();
  });

  it('el enlace debe volver a la raíz (la ruta /home no existe)', () => {
    expect(element.querySelector('a')?.getAttribute('href')).toBe('/');
  });
});
