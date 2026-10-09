import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PRIVACY_LAST_UPDATED, PrivacyComponent } from './privacy.component';

describe('PrivacyComponent', () => {
  let fixture: ComponentFixture<PrivacyComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivacyComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(PrivacyComponent);
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  const text = (): string => element.textContent ?? '';

  it('debe tener un único h1 y la fecha de actualización legible por máquinas', () => {
    expect(element.querySelectorAll('h1')).toHaveSize(1);
    expect(element.querySelector('time')?.getAttribute('datetime')).toBe(PRIVACY_LAST_UPDATED);
  });

  it('debe cubrir las secciones exigibles: responsable, datos, finalidad, consentimiento y derechos', () => {
    const headings = Array.from(element.querySelectorAll('h2')).map((h) => h.textContent);

    expect(headings).toEqual([
      '1. Responsable del tratamiento',
      '2. Datos que recogemos',
      '3. Para qué los usamos',
      '4. Consentimiento',
      '5. Proveedores y transferencia internacional',
      '6. Conservación',
      '7. Tus derechos',
      '8. Cookies',
      '9. Seguridad',
      '10. Cambios en esta política'
    ]);
  });

  it('debe citar la ley peruana, los derechos ARCO y la autoridad de control', () => {
    expect(text()).toContain('Ley N.º 29733');
    expect(text()).toContain('acceso, rectificación, cancelación y oposición');
    expect(text()).toContain('Autoridad Nacional de Protección de Datos Personales');
  });

  it('debe declarar la transferencia internacional a Formspree', () => {
    expect(text()).toContain('Formspree, Inc.');
    expect(text()).toContain('transferencia internacional');
  });

  it('cada sección debe estar etiquetada por su encabezado (regiones accesibles)', () => {
    element.querySelectorAll('section').forEach((section) => {
      const id = section.getAttribute('aria-labelledby')!;
      expect(section.querySelector(`h2#${id}`)).withContext(id).not.toBeNull();
    });
  });

  it('debe ofrecer el correo para ejercer derechos y un enlace al formulario de contacto', () => {
    expect(element.querySelector<HTMLAnchorElement>('a[href^="mailto:"]')!.href).toBe('mailto:pasonu60@gmail.com');
    expect(element.querySelector('a[href="/#contacto"]')).not.toBeNull();
  });
});
