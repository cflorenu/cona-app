import { Fighter, FightEvent, Match } from '../models';

export const makeFighter = (overrides: Partial<Fighter> = {}): Fighter => ({
  id: 'f-red',
  name: 'Rojo Test',
  nickname: 'Fuego',
  country: 'Perú',
  discipline: 'Lucha olímpica',
  weightClass: 'Peso ligero',
  heightCm: 175,
  reachCm: 178,
  record: { wins: 10, losses: 2, draws: 1 },
  winMethods: { koTko: 2, submission: 3, decision: 5 },
  signatureMoves: ['Suplex'],
  image: { src: 'assets/fighters/placeholder.svg', width: 400, height: 500, alt: 'Foto de Rojo Test' },
  profileUrl: '/roster/rojo-test',
  ...overrides
});

export const RED = makeFighter();
export const BLUE = makeFighter({
  id: 'f-blue',
  name: 'Azul Test',
  nickname: undefined,
  record: { wins: 8, losses: 3, draws: 0 },
  image: { src: 'assets/fighters/placeholder.svg', width: 400, height: 500, alt: 'Foto de Azul Test' }
});

export const makeMatch = (overrides: Partial<Match> = {}): Match => ({
  id: 'm-test',
  red: RED,
  blue: BLUE,
  weightClass: 'Peso ligero',
  rounds: 3,
  isTitleFight: false,
  isMainEvent: false,
  status: 'scheduled',
  ...overrides
});

export const makeEvent = (overrides: Partial<FightEvent> = {}): FightEvent => ({
  id: 'e-test',
  name: 'Evento Test',
  description: 'Descripción del evento',
  startDate: '2030-01-01T20:00:00-05:00',
  endDate: '2030-01-01T23:00:00-05:00',
  venue: { name: 'Coliseo Test', streetAddress: 'Calle 1', city: 'Lima', countryCode: 'PE' },
  image: { src: 'assets/banner.jpg', width: 1200, height: 630, alt: 'Banner' },
  tickets: { url: 'https://tickets.example/e-test', price: 50, currency: 'PEN', availability: 'InStock' },
  matches: [makeMatch({ isTitleFight: true, isMainEvent: true })],
  ...overrides
});
