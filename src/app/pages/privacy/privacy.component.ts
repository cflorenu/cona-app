import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

export const PRIVACY_LAST_UPDATED = '2026-10-09';

@Component({
  selector: 'app-privacy',
  imports: [RouterLink],
  templateUrl: './privacy.component.html',
  styleUrl: './privacy.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivacyComponent {
  readonly lastUpdated = PRIVACY_LAST_UPDATED;
}
