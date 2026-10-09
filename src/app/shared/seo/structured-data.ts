import { Fighter, FightEvent, ImageAsset } from '../../features/fight-night/models';
import { CLASS_SESSIONS, SCHEMA_TRAINING_DAYS } from '../data/schedule';

export type JsonLd = Record<string, unknown>;

const CONTEXT = 'https://schema.org';
export const ACADEMY_NAME = 'Con Atletas Sur';

export interface NewsArticleInput {
  headline: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
  image: ImageAsset;
  about?: FightEvent;
}

/** URL absoluta (requisito de Google para url/image). Sin dominio configurado, el campo se omite. */
export const absoluteUrl = (siteUrl: string, path: string): string | undefined =>
  siteUrl ? new URL(path, siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`).href : undefined;

/** Serialización segura para <script>: escapa "<" para que un "</script>" en los datos no rompa la etiqueta (XSS). */
export const serializeJsonLd = (data: JsonLd | JsonLd[]): string => JSON.stringify(data).replace(/</g, '\\u003c');

const personRef = (fighter: Fighter): JsonLd => ({ '@type': 'Person', name: fighter.name });

const organizer = (siteUrl: string): JsonLd => ({
  '@type': 'SportsOrganization',
  name: ACADEMY_NAME,
  url: absoluteUrl(siteUrl, '')
});

/** Negocio local (SEO local / Google Maps). Datos tomados del footer y del mapa embebido del sitio. */
export const buildAcademyJsonLd = (siteUrl: string): JsonLd => ({
  '@context': CONTEXT,
  '@type': 'SportsActivityLocation',
  name: ACADEMY_NAME,
  description: 'Academia de artes marciales en Villa El Salvador: Jiu Jitsu, Muay Thai, Sambo, Boxeo y clases privadas.',
  url: absoluteUrl(siteUrl, ''),
  image: absoluteUrl(siteUrl, 'assets/cona_logo.png'),
  telephone: '+51946893354',
  email: 'pasonu60@gmail.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Av. César Vallejo con Av. Revolución',
    addressLocality: 'Villa El Salvador',
    addressRegion: 'Lima',
    postalCode: '15834',
    addressCountry: 'PE'
  },
  geo: { '@type': 'GeoCoordinates', latitude: -12.2134, longitude: -76.9365 },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: SCHEMA_TRAINING_DAYS,
    opens: CLASS_SESSIONS[0].start,
    closes: CLASS_SESSIONS[CLASS_SESSIONS.length - 1].end
  },
  knowsAbout: ['Jiu Jitsu', 'Muay Thai', 'Sambo', 'Boxeo', 'Lucha'],
  sameAs: [
    'https://www.tiktok.com/@paulsobrado',
    'https://www.instagram.com/paul_sobrado/',
    'https://www.facebook.com/paulsobradonunta/'
  ]
});

/** Schema.org no tiene tipo "Athlete": un luchador es un Person vinculado a la organización. */
export const buildPersonJsonLd = (fighter: Fighter, siteUrl: string): JsonLd => ({
  '@context': CONTEXT,
  '@type': 'Person',
  name: fighter.name,
  alternateName: fighter.nickname,
  url: fighter.profileUrl ? absoluteUrl(siteUrl, fighter.profileUrl) : undefined,
  image: absoluteUrl(siteUrl, fighter.image.src),
  nationality: { '@type': 'Country', name: fighter.country },
  height: fighter.heightCm
    ? { '@type': 'QuantitativeValue', value: fighter.heightCm, unitCode: 'CMT' }
    : undefined,
  knowsAbout: [fighter.discipline, ...fighter.signatureMoves],
  memberOf: { '@type': 'SportsTeam', name: ACADEMY_NAME, sport: fighter.discipline },
  description: `${fighter.discipline}, ${fighter.weightClass}. Récord ${fighter.record.wins}-${fighter.record.losses}-${fighter.record.draws}.`
});

export const buildSportsEventJsonLd = (event: FightEvent, siteUrl: string): JsonLd => {
  const competitors = new Map(event.matches.flatMap((m) => [m.red, m.blue]).map((f) => [f.id, f]));
  return {
    '@context': CONTEXT,
    '@type': 'SportsEvent',
    name: event.name,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.venue.name,
      address: {
        '@type': 'PostalAddress',
        streetAddress: event.venue.streetAddress,
        addressLocality: event.venue.city,
        addressCountry: event.venue.countryCode
      }
    },
    image: event.image ? [absoluteUrl(siteUrl, event.image.src)] : undefined,
    organizer: organizer(siteUrl),
    offers: event.tickets
      ? {
          '@type': 'Offer',
          url: event.tickets.url,
          price: event.tickets.price,
          priceCurrency: event.tickets.currency,
          availability: `https://schema.org/${event.tickets.availability}`
        }
      : undefined,
    competitor: [...competitors.values()].map(personRef),
    subEvent: event.matches.map((m) => ({
      '@type': 'SportsEvent',
      name: `${m.red.name} vs ${m.blue.name}${m.isTitleFight ? ' (título)' : ''}`,
      startDate: event.startDate,
      location: { '@type': 'Place', name: event.venue.name },
      competitor: [personRef(m.red), personRef(m.blue)]
    }))
  };
};

/** Para crónicas de resultados y noticias del blog. */
export const buildNewsArticleJsonLd = (article: NewsArticleInput, siteUrl: string): JsonLd => ({
  '@context': CONTEXT,
  '@type': 'NewsArticle',
  headline: article.headline.slice(0, 110),
  description: article.description,
  mainEntityOfPage: absoluteUrl(siteUrl, article.path),
  image: [absoluteUrl(siteUrl, article.image.src)],
  datePublished: article.datePublished,
  dateModified: article.dateModified ?? article.datePublished,
  author: { '@type': 'Person', name: article.authorName },
  publisher: {
    '@type': 'Organization',
    name: ACADEMY_NAME,
    logo: { '@type': 'ImageObject', url: absoluteUrl(siteUrl, 'assets/cona_logo.png') }
  },
  about: article.about ? { '@type': 'SportsEvent', name: article.about.name, startDate: article.about.startDate } : undefined
});
