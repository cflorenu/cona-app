import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { OPTIMIZED_IMAGE } from '../../../shared/images/explicit-sizes.directive';
import { RouterLink } from '@angular/router';
import { Alignment, Fighter, WinMethods, formatRecord, toPercentages } from '../models';

export const ALIGNMENT_LABELS: Record<Alignment, string> = {
  face: 'Face',
  heel: 'Heel',
  tweener: 'Tweener'
};

export const WIN_METHOD_LABELS: Record<keyof WinMethods, string> = {
  koTko: 'KO / TKO',
  submission: 'Sumisión',
  decision: 'Decisión'
};

@Component({
  selector: 'app-fighter-profile-card',
  imports: [OPTIMIZED_IMAGE, RouterLink],
  templateUrl: './fighter-profile-card.component.html',
  styleUrl: './fighter-profile-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FighterProfileCardComponent {
  readonly fighter = input.required<Fighter>();
  /** Marca la imagen como LCP (p. ej. perfil destacado en la parte superior). */
  readonly priority = input(false);

  readonly alignmentLabels = ALIGNMENT_LABELS;
  readonly record = computed(() => formatRecord(this.fighter().record));

  readonly winBreakdown = computed(() => {
    const methods = this.fighter().winMethods;
    if (!methods) {
      return [];
    }
    const pct = toPercentages({ ...methods });
    return (Object.keys(WIN_METHOD_LABELS) as (keyof WinMethods)[]).map((key) => ({
      key,
      label: WIN_METHOD_LABELS[key],
      count: methods[key],
      percent: pct[key]
    }));
  });

  readonly physicalStats = computed(() => {
    const { heightCm, reachCm, weightClass } = this.fighter();
    return [
      { label: 'Categoría', value: weightClass },
      ...(heightCm ? [{ label: 'Altura', value: `${heightCm} cm` }] : []),
      ...(reachCm ? [{ label: 'Alcance', value: `${reachCm} cm` }] : [])
    ];
  });
}
