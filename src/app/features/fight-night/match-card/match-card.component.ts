import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { OPTIMIZED_IMAGE } from '../../../shared/images/explicit-sizes.directive';
import { Corner, Fighter, Match, PredictionTally, formatRecord, toPercentages } from '../models';

@Component({
  selector: 'app-match-card',
  imports: [OPTIMIZED_IMAGE],
  templateUrl: './match-card.component.html',
  styleUrl: './match-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MatchCardComponent {
  readonly match = input.required<Match>();
  /** Votos del público; si no se informa, no se muestra el bloque de predicción. */
  readonly prediction = input<PredictionTally>();
  /** Esquina elegida por el usuario actual (resalta su voto). */
  readonly userPick = input<Corner | null>(null);
  readonly predict = output<Corner>();

  readonly corners: readonly Corner[] = ['red', 'blue'];
  readonly formatRecord = formatRecord;

  readonly canPredict = computed(() => this.match().status === 'scheduled');
  readonly percentages = computed(() => {
    const tally = this.prediction();
    return tally ? toPercentages({ red: tally.red, blue: tally.blue }) : null;
  });

  readonly resultLabel = computed(() => {
    const { status, result } = this.match();
    if (status !== 'finished' || !result) {
      return null;
    }
    const winner = this.winner();
    const detail = [result.method, result.round && `R${result.round}`, result.time].filter(Boolean).join(' · ');
    return winner ? `Gana ${winner.name} por ${detail}` : `Sin ganador · ${detail}`;
  });

  fighter(corner: Corner): Fighter {
    return this.match()[corner];
  }

  outcome(corner: Corner): 'winner' | 'loser' | null {
    const { status, result } = this.match();
    if (status !== 'finished' || !result?.winnerId) {
      return null;
    }
    return result.winnerId === this.fighter(corner).id ? 'winner' : 'loser';
  }

  vote(corner: Corner): void {
    if (this.canPredict()) {
      this.predict.emit(corner);
    }
  }

  private winner(): Fighter | undefined {
    const id = this.match().result?.winnerId;
    return this.corners.map((c) => this.fighter(c)).find((f) => f.id === id);
  }
}
