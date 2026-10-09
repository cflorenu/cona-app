import { ChangeDetectionStrategy, Component, HostListener, signal } from '@angular/core';
import { OPTIMIZED_IMAGE } from '../../shared/images/explicit-sizes.directive';
import { DISCIPLINES } from '../../shared/data/disciplines';

@Component({
  selector: 'app-home',
  imports: [OPTIMIZED_IMAGE],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  readonly isScheduleOpen = signal(false);

  readonly disciplines = DISCIPLINES;

  openSchedule(): void {
    this.isScheduleOpen.set(true);
  }

  /** Cierra solo si el clic fue en el fondo oscuro, no dentro del diálogo. */
  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeSchedule();
    }
  }

  @HostListener('document:keydown.escape')
  closeSchedule(): void {
    this.isScheduleOpen.set(false);
  }
}
