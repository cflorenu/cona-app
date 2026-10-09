export interface Discipline {
  /** Ancla en Home (p. ej. /#muay-thai), usada por el footer. */
  slug: string;
  name: string;
  description: string;
  image: string;
  width: number;
  height: number;
}

export const DISCIPLINES: readonly Discipline[] = [
  {
    slug: 'jiu-jitsu',
    name: 'Jiu Jitsu',
    image: 'assets/jiu-jitsu.jpg',
    width: 1280,
    height: 720,
    description:
      'Domina el arte del control con el Jiu-Jitsu. Esta disciplina te enseñará a utilizar la técnica y la ' +
      'estrategia para someter a tus oponentes, sin importar su tamaño o fuerza. Perfecto para quienes buscan ' +
      'autodefensa y confianza.'
  },
  {
    slug: 'muay-thai',
    name: 'Muay Thai',
    image: 'assets/muay-thai.jpg',
    width: 1110,
    height: 625,
    description:
      'Conocido como el "arte de los ocho miembros", el Muay Thai te enseñará a utilizar tus puños, codos, ' +
      'rodillas y pies con precisión y poder. Mejora tu condición física y aprende técnicas letales en este ' +
      'deporte de combate.'
  },
  {
    slug: 'sambo',
    name: 'Sambo',
    image: 'assets/sambo.jpg',
    width: 1200,
    height: 800,
    description:
      'Arte marcial de origen ruso que combina los derribos de la lucha y el judo con llaves a brazos y piernas. ' +
      'Aprenderás a proyectar, controlar y finalizar en el suelo mientras ganas fuerza, equilibrio y reflejos. ' +
      'Una base completa para la defensa personal y las MMA.'
  },
  {
    slug: 'boxeo',
    name: 'Boxeo',
    image: 'assets/boxeo.webp',
    width: 3072,
    height: 2047,
    description:
      'El arte de los puños: guardia, desplazamientos, esquivas y combinaciones de golpes. Mejorarás tu ' +
      'resistencia, coordinación y velocidad de reacción mientras aprendes a defenderte con técnica y ' +
      'disciplina. Apto para todos los niveles, desde quien empieza hasta quien quiere competir.'
  }
];
