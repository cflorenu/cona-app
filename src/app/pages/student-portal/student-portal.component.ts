import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { OPTIMIZED_IMAGE } from '../../shared/images/explicit-sizes.directive';
import { RouterLink } from '@angular/router';
import { ModalService } from '../../services/modal.service';
import { STUDENT_HELP_WHATSAPP_URL } from '../../shared/data/contact-info';
import { DISCIPLINES } from '../../shared/data/disciplines';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  selector: 'app-student-portal',
  imports: [OPTIMIZED_IMAGE, RouterLink, IconComponent],
  templateUrl: './student-portal.component.html',
  styleUrl: './student-portal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StudentPortalComponent {
  private readonly modalService = inject(ModalService);

  readonly disciplines = DISCIPLINES;
  readonly whatsappUrl = STUDENT_HELP_WHATSAPP_URL;

  openFreeClass(): void {
    this.modalService.openModal();
  }
}
