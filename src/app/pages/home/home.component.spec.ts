import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;
  let component: HomeComponent;
  let element: HTMLElement;

  const modal = (): HTMLElement | null => element.querySelector('.modal');
  const scheduleButton = (): HTMLButtonElement => element.querySelector('.hero button')!;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HomeComponent] }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  describe('video hero', () => {
    it('debe estar silenciado como propiedad (requisito de autoplay) y con playsinline (iOS)', () => {
      const video = element.querySelector('video')!;

      expect(video.muted).toBeTrue();
      expect(video.hasAttribute('playsinline')).toBeTrue();
      expect(video.autoplay).toBeTrue();
    });

    it('debe ofrecer WebM 720p con respaldo MP4 y un poster ligero para el primer pintado', () => {
      const video = element.querySelector('video')!;
      const sources = Array.from(video.querySelectorAll('source')).map((s) => s.getAttribute('src'));

      expect(sources).toEqual(['assets/video/wrestling-720.webm', 'assets/video/wrestling-720.mp4']);
      expect(video.getAttribute('poster')).toBe('assets/video/wrestling-poster.webp');
    });
  });

  describe('disciplinas', () => {
    it('debe renderizar una sección por disciplina con nombre e imagen accesible', () => {
      const rows = element.querySelectorAll('.container .row');
      expect(rows).toHaveSize(component.disciplines.length);

      component.disciplines.forEach((discipline, i) => {
        const img = rows[i].querySelector('img')!;
        expect(rows[i].querySelector('h2')?.textContent).toBe(discipline.name);
        expect(img.getAttribute('src')).toBe(discipline.image);
        expect(img.alt).toBe(`Clase de ${discipline.name}`);
        expect(img.getAttribute('loading')).toBe('lazy');
      });
    });

    it('cada disciplina debe tener un ancla estable para los enlaces del footer (/#slug)', () => {
      const ids = Array.from(element.querySelectorAll('.container .row')).map((r) => r.id);
      expect(ids).toEqual(component.disciplines.map((d) => d.slug));
    });

    it('debe alternar el sentido de las filas (zig-zag)', () => {
      const reversed = Array.from(element.querySelectorAll('.container .row')).map((r) =>
        r.classList.contains('flex-row-reverse')
      );
      expect(reversed).toEqual([false, true, false, true]);
    });

    it('los botones "Ver clases" deben abrir el horario', () => {
      const buttons = Array.from(element.querySelectorAll<HTMLButtonElement>('.container .row button'));
      buttons[2].click();
      fixture.detectChanges();

      expect(component.isScheduleOpen()).toBeTrue();
    });
  });

  describe('modal de horario', () => {
    it('debe estar cerrado inicialmente y no existir en el DOM', () => {
      expect(component.isScheduleOpen()).toBeFalse();
      expect(modal()).toBeNull();
    });

    it('debe abrirse con el botón "Horario de clases" y ser accesible', () => {
      scheduleButton().click();
      fixture.detectChanges();

      const dialog = modal()!;
      expect(dialog.getAttribute('role')).toBe('dialog');
      expect(dialog.getAttribute('aria-modal')).toBe('true');
      expect(dialog.getAttribute('aria-labelledby')).toBe('scheduleModalLabel');
      expect(dialog.querySelector('img')?.alt).toBe('Horario de Clases');
    });

    it('debe cerrarse con el botón de cerrar', () => {
      component.openSchedule();
      fixture.detectChanges();

      element.querySelector<HTMLButtonElement>('.btn-close')!.click();
      fixture.detectChanges();

      expect(modal()).toBeNull();
    });

    it('debe cerrarse al hacer clic en el fondo', () => {
      component.openSchedule();
      fixture.detectChanges();

      modal()!.click();
      fixture.detectChanges();

      expect(component.isScheduleOpen()).toBeFalse();
    });

    it('no debe cerrarse al hacer clic dentro del diálogo', () => {
      component.openSchedule();
      fixture.detectChanges();

      element.querySelector<HTMLElement>('.modal-content')!.click();
      fixture.detectChanges();

      expect(component.isScheduleOpen()).toBeTrue();
    });

    it('Escape con el foco dentro del diálogo debe cerrarlo', () => {
      component.openSchedule();
      fixture.detectChanges();

      element
        .querySelector('.btn-close')!
        .dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

      expect(component.isScheduleOpen()).toBeFalse();
    });

    it('Enter dentro del diálogo no debe cerrarlo', () => {
      component.openSchedule();
      fixture.detectChanges();

      element
        .querySelector('.modal-content')!
        .dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

      expect(component.isScheduleOpen()).toBeTrue();
    });

    it('debe cerrarse con la tecla Escape', () => {
      component.openSchedule();
      fixture.detectChanges();

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      fixture.detectChanges();

      expect(modal()).toBeNull();
    });
  });

  it('todas las imágenes deben declarar dimensiones o usar modo fill (evita CLS)', () => {
    element.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
      const hasDims = img.hasAttribute('width') && img.hasAttribute('height');
      const isFill = img.style.position === 'absolute';
      expect(hasDims || isFill).withContext(img.getAttribute('src')!).toBeTrue();
    });
  });
});
