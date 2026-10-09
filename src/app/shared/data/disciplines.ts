export interface Discipline {
  /** Ancla en Home (p. ej. /#muay-thai), usada por el footer. */
  slug: string;
  name: string;
  description: string;
  image: string;
  width: number;
  height: number;
}

// TODO(contenido): Sambo y Boxeo reutilizan los textos de Jiu-Jitsu y Muay Thai; reemplazar por su copy real.
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
      'Domina el arte del control con el Jiu-Jitsu. Esta disciplina te enseñará a utilizar la técnica y la ' +
      'estrategia para someter a tus oponentes, sin importar su tamaño o fuerza. Perfecto para quienes buscan ' +
      'autodefensa y confianza.'
  },
  {
    slug: 'boxeo',
    name: 'Boxeo',
    image: 'assets/boxeo.webp',
    width: 3072,
    height: 2047,
    description:
      'Conocido como el "arte de los ocho miembros", el Muay Thai te enseñará a utilizar tus puños, codos, ' +
      'rodillas y pies con precisión y poder. Mejora tu condición física y aprende técnicas letales en este ' +
      'deporte de combate.'
  }
];
