import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ModalService } from '../../services/modal.service';
import { STUDENT_HELP_WHATSAPP_URL } from '../../shared/data/contact-info';
import { DISCIPLINES } from '../../shared/data/disciplines';
import { StudentPortalComponent } from './student-portal.component';

describe('StudentPortalComponent', () => {
  let fixture: ComponentFixture<StudentPortalComponent>;
  let element: HTMLElement;
  let modalService: jasmine.SpyObj<ModalService>;

  beforeEach(async () => {
    modalService = jasmine.createSpyObj<ModalService>('ModalService', ['openModal']);

    await TestBed.configureTestingModule({
      imports: [StudentPortalComponent],
      providers: [provideRouter([]), { provide: ModalService, useValue: modalService }]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentPortalComponent);
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('debe tener un único h1 con el título del portal', () => {
    expect(element.querySelectorAll('h1')).toHaveSize(1);
    expect(element.querySelector('h1')?.textContent).toContain('Portal');
  });

  it('la sección de horario debe tener el ancla #horario (enlazada desde el footer)', () => {
    expect(element.querySelector('section#horario img[src="assets/horario.png"]')).not.toBeNull();
  });

  it('debe mostrar el horario de clases', () => {
    const img = element.querySelector<HTMLImageElement>('img[src="assets/horario.png"]')!;
    expect(img.alt).toBe('Horario de clases de la academia');
  });

  it('debe mostrar una tarjeta por disciplina', () => {
    const titles = Array.from(element.querySelectorAll('.card-title')).map((t) => t.textContent?.trim());
    expect(titles).toEqual(DISCIPLINES.map((d) => d.name));
  });

  it('"Agenda una clase gratis" debe abrir el modal de inscripción', () => {
    element.querySelector<HTMLButtonElement>('button.btn-warning')!.click();
    expect(modalService.openModal).toHaveBeenCalledTimes(1);
  });

  it('el enlace de WhatsApp debe abrir el chat de alumnos de forma segura', () => {
    const link = element.querySelector<HTMLAnchorElement>('a.btn-success')!;

    expect(link.href).toBe(STUDENT_HELP_WHATSAPP_URL);
    expect(link.target).toBe('_blank');
    expect(link.rel).toBe('noopener noreferrer');
  });

  it('"Envíanos un mensaje" debe llevar al formulario de contacto', () => {
    expect(element.querySelector('a.btn-outline-dark')?.getAttribute('href')).toBe('/#contacto');
  });

  it('todas las imágenes deben declarar dimensiones o usar modo fill (evita CLS)', () => {
    element.querySelectorAll('img').forEach((img) => {
      const hasDims = img.hasAttribute('width') && img.hasAttribute('height');
      const isFill = img.style.position === 'absolute';
      expect(hasDims || isFill).withContext(img.src).toBeTrue();
    });
  });
});
