import { TestBed } from '@angular/core/testing';
import { ModalService } from './modal.service';

describe('ModalService', () => {
  let service: ModalService;
  let states: boolean[];

  beforeEach(() => {
    service = TestBed.inject(ModalService);
    states = [];
    service.modalState$.subscribe((state) => states.push(state));
  });

  it('debe iniciar cerrado', () => {
    expect(states).toEqual([false]);
  });

  it('openModal debe emitir true y closeModal false', () => {
    service.openModal();
    service.closeModal();

    expect(states).toEqual([false, true, false]);
  });

  it('nuevos suscriptores deben recibir el último estado', () => {
    service.openModal();
    let late: boolean | undefined;

    service.modalState$.subscribe((state) => (late = state));

    expect(late).toBeTrue();
  });
});
