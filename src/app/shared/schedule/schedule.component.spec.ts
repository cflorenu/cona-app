import { TestBed } from '@angular/core/testing';
import { CLASS_SESSIONS, formatDuration, formatTime } from '../data/schedule';
import { ScheduleComponent } from './schedule.component';

describe('horario (datos)', () => {
  it('formatTime debe convertir a formato de 12 h peruano', () => {
    expect(formatTime('18:30')).toBe('6:30 p. m.');
    expect(formatTime('21:00')).toBe('9:00 p. m.');
    expect(formatTime('12:05')).toBe('12:05 p. m.');
    expect(formatTime('00:15')).toBe('12:15 a. m.');
    expect(formatTime('06:30')).toBe('6:30 a. m.');
  });

  it('formatDuration debe expresar horas y minutos', () => {
    expect(formatDuration({ start: '18:30', end: '19:30' })).toBe('1 h');
    expect(formatDuration({ start: '19:30', end: '21:00' })).toBe('1 h 30 min');
    expect(formatDuration({ start: '19:00', end: '19:45' })).toBe('45 min');
  });

  it('los turnos deben ser consecutivos y sin solaparse', () => {
    for (let i = 1; i < CLASS_SESSIONS.length; i++) {
      expect(CLASS_SESSIONS[i].start >= CLASS_SESSIONS[i - 1].end).withContext(CLASS_SESSIONS[i].group).toBeTrue();
    }
  });
});

describe('ScheduleComponent', () => {
  let element: HTMLElement;

  beforeEach(() => {
    const fixture = TestBed.createComponent(ScheduleComponent);
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  it('debe mostrar los días de entrenamiento: lunes a sábado', () => {
    expect(element.querySelector('.schedule__days')?.textContent).toContain('Lunes a sábado');
    const chips = Array.from(element.querySelectorAll('.schedule__chips li'));
    expect(chips.map((c) => c.textContent)).toEqual(['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']);
    expect(chips[0].getAttribute('aria-label')).toBe('Lunes');
  });

  it('debe mostrar los turnos de niños y jóvenes con su horario y duración', () => {
    const sessions = Array.from(element.querySelectorAll('.session')).map((s) => ({
      group: s.querySelector('.session__group')?.textContent,
      time: s.querySelector('.session__time')?.textContent?.replace(/\s+/g, ' ').trim(),
      duration: s.querySelector('.session__duration')?.textContent
    }));

    expect(sessions).toEqual([
      { group: 'Niños', time: '6:30 p. m. – 7:30 p. m.', duration: '1 h' },
      { group: 'Jóvenes', time: '7:30 p. m. – 9:00 p. m.', duration: '1 h 30 min' }
    ]);
  });

  it('las horas deben ser legibles por máquinas (<time datetime>)', () => {
    const times = Array.from(element.querySelectorAll('time')).map((t) => t.getAttribute('datetime'));
    expect(times).toEqual(['18:30', '19:30', '19:30', '21:00']);
  });
});
