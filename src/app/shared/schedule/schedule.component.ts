import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  CLASS_SESSIONS,
  TRAINING_DAYS,
  TRAINING_DAYS_LABEL,
  formatDuration,
  formatTime
} from '../data/schedule';
import { IconComponent } from '../icon/icon.component';

/** Horario de clases en HTML (accesible e indexable). Hereda el color del contenedor: sirve en fondo claro u oscuro. */
@Component({
  selector: 'app-schedule',
  imports: [IconComponent],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScheduleComponent {
  readonly days = TRAINING_DAYS;
  readonly daysLabel = TRAINING_DAYS_LABEL;
  readonly sessions = CLASS_SESSIONS.map((session) => ({
    ...session,
    startLabel: formatTime(session.start),
    endLabel: formatTime(session.end),
    duration: formatDuration(session)
  }));
}
