export type Corner = 'red' | 'blue';

/** Solo aplica a shows de lucha libre profesional (storylines); en deportes de combate reales se omite. */
export type Alignment = 'face' | 'heel' | 'tweener';

export type MatchStatus = 'scheduled' | 'live' | 'finished';

export interface ImageAsset {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export interface FighterRecord {
  wins: number;
  losses: number;
  draws: number;
}

export interface WinMethods {
  koTko: number;
  submission: number;
  decision: number;
}

export interface Fighter {
  id: string;
  name: string;
  nickname?: string;
  country: string;
  discipline: string;
  weightClass: string;
  heightCm?: number;
  reachCm?: number;
  record: FighterRecord;
  winMethods?: WinMethods;
  signatureMoves: readonly string[];
  alignment?: Alignment;
  image: ImageAsset;
  /** Ruta interna del perfil completo, p. ej. /roster/marco-quispe */
  profileUrl?: string;
}

export interface MatchResult {
  /** null = empate o sin resultado */
  winnerId: string | null;
  method: string;
  round?: number;
  time?: string;
}

export interface Match {
  id: string;
  red: Fighter;
  blue: Fighter;
  weightClass: string;
  rounds: number;
  isTitleFight: boolean;
  isMainEvent: boolean;
  status: MatchStatus;
  result?: MatchResult;
}

export interface Venue {
  name: string;
  streetAddress: string;
  city: string;
  countryCode: string;
}

export interface TicketOffer {
  url: string;
  price: number;
  currency: string;
  availability: 'InStock' | 'SoldOut' | 'PreOrder';
}

export interface FightEvent {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  venue: Venue;
  image?: ImageAsset;
  tickets?: TicketOffer;
  matches: readonly Match[];
}

export interface PredictionTally {
  red: number;
  blue: number;
}

export const formatRecord = ({ wins, losses, draws }: FighterRecord): string => `${wins}-${losses}-${draws}`;

/** Porcentaje entero de cada parte sobre el total; 0 si no hay datos. */
export const toPercentages = <K extends string>(values: Record<K, number>): Record<K, number> => {
  const total = Object.values<number>(values).reduce((sum, v) => sum + v, 0);
  return Object.fromEntries(
    Object.entries<number>(values).map(([key, v]) => [key, total === 0 ? 0 : Math.round((v / total) * 100)])
  ) as Record<K, number>;
};
