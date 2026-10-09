import { Fighter, FightEvent, ImageAsset, PredictionTally } from '../models';

// DATOS DE DEMOSTRACIÓN: personas y récords ficticios para previsualizar los componentes.
// No publicar: reemplazar por datos reales desde un CMS o API.

const placeholder = (name: string): ImageAsset => ({
  src: 'assets/fighters/placeholder.svg',
  width: 400,
  height: 500,
  alt: `Foto de ${name}`
});

const fighter = (data: Omit<Fighter, 'image'>): Fighter => ({ ...data, image: placeholder(data.name) });

export const DEMO_FIGHTERS: readonly Fighter[] = [
  fighter({
    id: 'demo-condor',
    name: 'Marco Demo',
    nickname: 'El Cóndor',
    country: 'Perú',
    discipline: 'Lucha olímpica',
    weightClass: 'Peso ligero',
    heightCm: 175,
    reachCm: 178,
    record: { wins: 14, losses: 2, draws: 1 },
    winMethods: { koTko: 2, submission: 3, decision: 9 },
    signatureMoves: ['Suplex de cintura', 'Doble pierna']
  }),
  fighter({
    id: 'demo-huracan',
    name: 'Iván Ejemplo',
    nickname: 'Huracán',
    country: 'Perú',
    discipline: 'Jiu Jitsu',
    weightClass: 'Peso ligero',
    heightCm: 178,
    reachCm: 180,
    record: { wins: 11, losses: 3, draws: 0 },
    winMethods: { koTko: 1, submission: 8, decision: 2 },
    signatureMoves: ['Triángulo', 'Raspada de gancho']
  }),
  fighter({
    id: 'demo-titan',
    name: 'Luis Muestra',
    nickname: 'Titán',
    country: 'Perú',
    discipline: 'Muay Thai',
    weightClass: 'Peso wélter',
    heightCm: 180,
    record: { wins: 9, losses: 1, draws: 0 },
    winMethods: { koTko: 7, submission: 0, decision: 2 },
    signatureMoves: ['Codazo giratorio', 'Rodilla en clinch']
  }),
  fighter({
    id: 'demo-rayo',
    name: 'Diego Prueba',
    nickname: 'Rayo',
    country: 'Chile',
    discipline: 'Boxeo',
    weightClass: 'Peso wélter',
    record: { wins: 8, losses: 4, draws: 1 },
    winMethods: { koTko: 5, submission: 0, decision: 3 },
    signatureMoves: ['Gancho al hígado']
  }),
  fighter({
    id: 'demo-sombra',
    name: 'Raúl Ficticio',
    nickname: 'La Sombra',
    country: 'Perú',
    discipline: 'Lucha libre (exhibición)',
    weightClass: 'Peso pesado',
    record: { wins: 20, losses: 9, draws: 0 },
    signatureMoves: ['Martinete', 'Plancha desde la tercera cuerda'],
    alignment: 'heel'
  }),
  fighter({
    id: 'demo-guardian',
    name: 'Andrés Simulado',
    nickname: 'El Guardián',
    country: 'Bolivia',
    discipline: 'Lucha libre (exhibición)',
    weightClass: 'Peso pesado',
    record: { wins: 17, losses: 6, draws: 2 },
    signatureMoves: ['Huracarrana'],
    alignment: 'face'
  })
];

const [condor, huracan, titan, rayo, sombra, guardian] = DEMO_FIGHTERS;

export const DEMO_EVENT: FightEvent = {
  id: 'fight-night-demo',
  name: 'Con Atletas Fight Night (DEMO)',
  description: 'Velada de deportes de combate con lucha olímpica, Muay Thai y una exhibición de lucha libre.',
  startDate: '2026-12-12T20:00:00-05:00',
  endDate: '2026-12-12T23:30:00-05:00',
  venue: {
    name: 'Coliseo de demostración',
    streetAddress: 'Av. Revolución s/n',
    city: 'Villa El Salvador',
    countryCode: 'PE'
  },
  matches: [
    {
      id: 'm1',
      red: condor,
      blue: huracan,
      weightClass: 'Peso ligero',
      rounds: 5,
      isTitleFight: true,
      isMainEvent: true,
      status: 'scheduled'
    },
    {
      id: 'm2',
      red: titan,
      blue: rayo,
      weightClass: 'Peso wélter',
      rounds: 3,
      isTitleFight: false,
      isMainEvent: false,
      status: 'live'
    },
    {
      id: 'm3',
      red: sombra,
      blue: guardian,
      weightClass: 'Peso pesado',
      rounds: 1,
      isTitleFight: false,
      isMainEvent: false,
      status: 'finished',
      result: { winnerId: 'demo-guardian', method: 'Pinfall', round: 1, time: '12:41' }
    }
  ]
};

export const DEMO_PREDICTIONS: Record<string, PredictionTally> = {
  m1: { red: 124, blue: 87 },
  m2: { red: 40, blue: 52 },
  m3: { red: 30, blue: 71 }
};

/** Stream HLS público de prueba (Mux) para previsualizar el reproductor. */
export const DEMO_STREAM = {
  url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  title: 'Transmisión de prueba (DEMO)',
  poster: 'assets/video/wrestling-poster.webp'
};
