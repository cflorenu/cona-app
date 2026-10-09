import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  PLATFORM_ID,
  computed,
  inject,
  input,
  output,
  signal
} from '@angular/core';

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const splitDuration = (ms: number): CountdownParts => ({
  days: Math.floor(ms / DAY),
  hours: Math.floor((ms % DAY) / HOUR),
  minutes: Math.floor((ms % HOUR) / MINUTE),
  seconds: Math.floor((ms % MINUTE) / SECOND)
});

@Component({
  selector: 'app-event-countdown',
  templateUrl: './event-countdown.component.html',
  styleUrl: './event-countdown.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventCountdownComponent implements OnInit {
  /** Fecha ISO 8601 del inicio del evento. */
  readonly target = input.required<string>();
  readonly started = output<void>();

  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly now = signal(Date.now());
  readonly remaining = computed(() => Math.max(0, Date.parse(this.target()) - this.now()));
  readonly parts = computed(() => splitDuration(this.remaining()));
  readonly isLive = computed(() => this.remaining() === 0);
  readonly units = [
    { key: 'days', label: 'Días' },
    { key: 'hours', label: 'Horas' },
    { key: 'minutes', label: 'Min' },
    { key: 'seconds', label: 'Seg' }
  ] as const;

  ngOnInit(): void {
    // En el prerender (servidor) no se arranca el intervalo: impediría que la app se estabilice.
    if (!this.isBrowser || this.isLive()) {
      return;
    }
    // App zoneless: el intervalo no bloquea la estabilidad (hidratación) y el signal refresca solo esta vista.
    const id = setInterval(() => {
      this.now.set(Date.now());
      if (this.isLive()) {
        clearInterval(id);
        this.started.emit();
      }
    }, SECOND);
    this.destroyRef.onDestroy(() => clearInterval(id));
  }
}
