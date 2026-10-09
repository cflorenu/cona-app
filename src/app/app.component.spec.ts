import { DOCUMENT } from '@angular/core';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { DeferBlockBehavior, DeferBlockState, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { AppComponent, HEADER_OFFSET_PX } from './app.component';
import { ModalService } from './services/modal.service';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([]), provideHttpClient(withXhr()), provideHttpClientTesting()]
    }).compileComponents();
  });

  it('debe publicar el JSON-LD de la academia (SEO local)', () => {
    TestBed.createComponent(AppComponent);
    const script = TestBed.inject(DOCUMENT).getElementById('jsonld-organization')!;

    expect(script.getAttribute('type')).toBe('application/ld+json');
    expect(JSON.parse(script.textContent!)['@type']).toBe('SportsActivityLocation');
  });

  it('"Saltar al contenido" debe llevar el foco al <main> sin navegar', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const skip = root.querySelector<HTMLAnchorElement>('.skip-link')!;
    const event = new MouseEvent('click', { cancelable: true });

    skip.dispatchEvent(event);

    expect(skip.textContent).toBe('Saltar al contenido');
    expect(event.defaultPrevented).toBeTrue();
    expect(document.activeElement).toBe(root.querySelector('main#contenido'));
  });

  it('las anclas deben compensar el alto del header fijo', () => {
    const setOffset = spyOn(TestBed.inject(ViewportScroller), 'setOffset');

    TestBed.createComponent(AppComponent);

    expect(setOffset).toHaveBeenCalledOnceWith([0, HEADER_OFFSET_PX]);
  });

  it('debe crear la aplicación', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('debe renderizar navbar, contenido, zona de contacto y footer; los formularios se difieren', () => {
    TestBed.configureTestingModule({ deferBlockBehavior: DeferBlockBehavior.Manual });
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    const order = Array.from(root.children).map((el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id : ''));

    expect(order).toEqual(['a', 'app-navbar', 'main#contenido', 'div#contacto', 'app-footer']);
    expect(root.querySelector('main router-outlet')).not.toBeNull();
    expect(root.querySelector('#contacto .contact-slot__placeholder')).not.toBeNull();
    expect(root.querySelector('app-contact-form, app-subscribe-modal')).toBeNull();
  });

  it('el formulario de contacto debe renderizarse dentro de #contacto (ancla del footer)', async () => {
    TestBed.configureTestingModule({ deferBlockBehavior: DeferBlockBehavior.Manual });
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const [contactBlock] = await fixture.getDeferBlocks();
    await contactBlock.render(DeferBlockState.Complete);

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('#contacto app-contact-form')).not.toBeNull();
    expect(root.querySelector('.contact-slot__placeholder')).toBeNull();
  });

  it('el modal de clase gratis solo se crea al abrirse', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('app-subscribe-modal')).toBeNull();

    TestBed.inject(ModalService).openModal();
    // La condición dispara la descarga del chunk; se espera a que se resuelva y se renderice.
    for (let i = 0; i < 20 && !root.querySelector('app-subscribe-modal .modal'); i++) {
      fixture.detectChanges();
      await fixture.whenStable();
      await new Promise((resolve) => setTimeout(resolve));
    }

    expect(root.querySelector('app-subscribe-modal .modal')).not.toBeNull();
  });
});
