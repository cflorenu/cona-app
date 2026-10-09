import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Fighter } from '../models';
import { makeFighter } from '../testing/fixtures';
import { FighterProfileCardComponent } from './fighter-profile-card.component';

describe('FighterProfileCardComponent', () => {
  let fixture: ComponentFixture<FighterProfileCardComponent>;
  let element: HTMLElement;

  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  const render = (fighter: Fighter, priority = false): void => {
    fixture = TestBed.createComponent(FighterProfileCardComponent);
    fixture.componentRef.setInput('fighter', fighter);
    fixture.componentRef.setInput('priority', priority);
    fixture.detectChanges();
    element = fixture.nativeElement;
  };
  const texts = (selector: string): (string | undefined)[] =>
    Array.from(element.querySelectorAll(selector)).map((e) => e.textContent?.trim());

  it('debe mostrar identidad: disciplina, país, nombre y apodo', () => {
    render(makeFighter());

    expect(element.querySelector('.profile__discipline')?.textContent).toBe('Lucha olímpica · Perú');
    expect(element.querySelector('h3')?.textContent).toBe('Rojo Test');
    expect(element.querySelector('.profile__nick')?.textContent).toBe('"Fuego"');
  });

  it('sin apodo no debe renderizar la línea del apodo', () => {
    render(makeFighter({ nickname: undefined }));
    expect(element.querySelector('.profile__nick')).toBeNull();
  });

  it('debe mostrar el récord desglosado y en texto para lectores de pantalla', () => {
    render(makeFighter());

    expect(texts('.profile__record dd')).toEqual(['10', '2', '1']);
    expect(element.querySelector('.visually-hidden')?.textContent).toBe('Récord: 10-2-1');
  });

  it('debe mostrar categoría, altura y alcance cuando existen', () => {
    render(makeFighter());
    expect(texts('.profile__stats dd')).toEqual(['Peso ligero', '175 cm', '178 cm']);
  });

  it('debe omitir altura y alcance si no se conocen', () => {
    render(makeFighter({ heightCm: undefined, reachCm: undefined }));
    expect(texts('.profile__stats dt')).toEqual(['Categoría']);
  });

  it('debe mostrar las victorias por método con porcentajes', () => {
    render(makeFighter({ winMethods: { koTko: 2, submission: 3, decision: 5 } }));

    expect(texts('.method__label')).toEqual(['KO / TKO', 'Sumisión', 'Decisión']);
    expect(texts('.method__value')).toEqual(['2 (20%)', '3 (30%)', '5 (50%)']);
    expect(element.querySelector<HTMLElement>('.method__fill')!.style.width).toBe('20%');
  });

  it('sin desglose de victorias ni movimientos no debe renderizar esas secciones', () => {
    render(makeFighter({ winMethods: undefined, signatureMoves: [] }));

    expect(element.querySelector('.method')).toBeNull();
    expect(element.querySelector('.moves')).toBeNull();
  });

  it('debe listar los movimientos signature', () => {
    render(makeFighter({ signatureMoves: ['Suplex', 'Doble pierna'] }));
    expect(texts('.moves li')).toEqual(['Suplex', 'Doble pierna']);
  });

  it('la alineación Heel/Face es opcional y se muestra como badge', () => {
    render(makeFighter());
    expect(element.querySelector('.profile__alignment')).toBeNull();

    render(makeFighter({ alignment: 'heel' }));
    const badge = element.querySelector('.profile__alignment')!;
    expect(badge.textContent).toBe('Heel');
    expect(badge.classList).toContain('profile__alignment--heel');
  });

  it('debe enlazar al perfil completo solo si existe la ruta', () => {
    render(makeFighter());
    expect(element.querySelector('.profile__cta')?.getAttribute('href')).toBe('/roster/rojo-test');

    render(makeFighter({ profileUrl: undefined }));
    expect(element.querySelector('.profile__cta')).toBeNull();
  });

  it('la foto debe ocupar su contenedor (fill, sin CLS), ser responsiva y diferida salvo que sea prioritaria', () => {
    render(makeFighter());
    const img = element.querySelector('img')!;
    expect(img.style.position).toBe('absolute');
    expect(img.getAttribute('sizes')).toContain('vw');
    expect(img.getAttribute('loading')).toBe('lazy');

    render(makeFighter(), true);
    expect(element.querySelector('img')!.getAttribute('fetchpriority')).toBe('high');
  });
});
