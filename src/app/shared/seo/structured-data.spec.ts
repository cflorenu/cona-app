import { BLUE, RED, makeEvent, makeFighter, makeMatch } from '../../features/fight-night/testing/fixtures';
import {
  ACADEMY_NAME,
  NewsArticleInput,
  absoluteUrl,
  buildAcademyJsonLd,
  buildNewsArticleJsonLd,
  buildPersonJsonLd,
  buildSportsEventJsonLd,
  serializeJsonLd
} from './structured-data';

/** Lo que realmente se publica: JSON.stringify descarta campos undefined. */
const emitted = (data: object) => JSON.parse(JSON.stringify(data));

const SITE = 'https://www.ejemplo.pe';

describe('structured-data (JSON-LD)', () => {
  describe('absoluteUrl', () => {
    it('debe construir URLs absolutas con o sin barra final en el dominio', () => {
      expect(absoluteUrl(SITE, 'assets/logo.png')).toBe('https://www.ejemplo.pe/assets/logo.png');
      expect(absoluteUrl(`${SITE}/`, '/roster/x')).toBe('https://www.ejemplo.pe/roster/x');
      expect(absoluteUrl(SITE, '')).toBe('https://www.ejemplo.pe/');
    });

    it('sin dominio configurado debe devolver undefined (el campo se omite)', () => {
      expect(absoluteUrl('', 'assets/logo.png')).toBeUndefined();
    });
  });

  describe('serializeJsonLd', () => {
    it('debe escapar "<" para impedir cerrar el <script> e inyectar HTML (XSS)', () => {
      const out = serializeJsonLd({ name: '</script><script>alert(1)</script>' });

      expect(out).not.toContain('<');
      expect(JSON.parse(out).name).toBe('</script><script>alert(1)</script>');
    });
  });

  describe('buildAcademyJsonLd', () => {
    it('debe describir la academia como SportsActivityLocation con dirección, geo y redes', () => {
      const ld = emitted(buildAcademyJsonLd(SITE));

      expect(ld['@context']).toBe('https://schema.org');
      expect(ld['@type']).toBe('SportsActivityLocation');
      expect(ld['name']).toBe(ACADEMY_NAME);
      expect(ld['url']).toBe('https://www.ejemplo.pe/');
      expect(ld['address']['addressCountry']).toBe('PE');
      expect(ld['address']['addressLocality']).toBe('Villa El Salvador');
      expect(ld['geo']['@type']).toBe('GeoCoordinates');
      expect(ld['telephone']).toMatch(/^\+51\d{9}$/);
      expect(ld['sameAs'].length).toBeGreaterThan(0);
      expect(ld['openingHoursSpecification']).toEqual({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'https://schema.org/Monday',
          'https://schema.org/Tuesday',
          'https://schema.org/Wednesday',
          'https://schema.org/Thursday',
          'https://schema.org/Friday',
          'https://schema.org/Saturday'
        ],
        opens: '18:30',
        closes: '21:00'
      });
    });

    it('sin dominio debe omitir url e image', () => {
      const ld = emitted(buildAcademyJsonLd(''));
      expect(ld['url']).toBeUndefined();
      expect(ld['image']).toBeUndefined();
    });
  });

  describe('buildPersonJsonLd', () => {
    it('debe mapear un luchador a Person (Schema.org no tiene tipo Athlete)', () => {
      const ld = emitted(buildPersonJsonLd(makeFighter(), SITE));

      expect(ld['@type']).toBe('Person');
      expect(ld['name']).toBe('Rojo Test');
      expect(ld['alternateName']).toBe('Fuego');
      expect(ld['url']).toBe('https://www.ejemplo.pe/roster/rojo-test');
      expect(ld['image']).toBe('https://www.ejemplo.pe/assets/fighters/placeholder.svg');
      expect(ld['height']).toEqual({ '@type': 'QuantitativeValue', value: 175, unitCode: 'CMT' });
      expect(ld['nationality']).toEqual({ '@type': 'Country', name: 'Perú' });
      expect(ld['knowsAbout']).toEqual(['Lucha olímpica', 'Suplex']);
      expect(ld['memberOf']['@type']).toBe('SportsTeam');
      expect(ld['description']).toContain('Récord 10-2-1');
    });

    it('debe omitir url y altura si no existen', () => {
      const ld = emitted(buildPersonJsonLd(makeFighter({ profileUrl: undefined, heightCm: undefined }), SITE));
      expect(ld['url']).toBeUndefined();
      expect(ld['height']).toBeUndefined();
    });
  });

  describe('buildSportsEventJsonLd', () => {
    it('debe generar un SportsEvent completo con lugar, oferta, competidores y sub-eventos', () => {
      const ld = emitted(buildSportsEventJsonLd(makeEvent(), SITE));

      expect(ld['@type']).toBe('SportsEvent');
      expect(ld['startDate']).toBe('2030-01-01T20:00:00-05:00');
      expect(ld['eventStatus']).toBe('https://schema.org/EventScheduled');
      expect(ld['eventAttendanceMode']).toBe('https://schema.org/OfflineEventAttendanceMode');
      expect(ld['location']['address']['addressLocality']).toBe('Lima');
      expect(ld['image']).toEqual(['https://www.ejemplo.pe/assets/banner.jpg']);
      expect(ld['organizer']).toEqual({ '@type': 'SportsOrganization', name: ACADEMY_NAME, url: 'https://www.ejemplo.pe/' });
      expect(ld['offers']).toEqual({
        '@type': 'Offer',
        url: 'https://tickets.example/e-test',
        price: 50,
        priceCurrency: 'PEN',
        availability: 'https://schema.org/InStock'
      });
      expect(ld['competitor']).toEqual([
        { '@type': 'Person', name: RED.name },
        { '@type': 'Person', name: BLUE.name }
      ]);
      expect(ld['subEvent'][0]['name']).toBe('Rojo Test vs Azul Test (título)');
    });

    it('no debe duplicar competidores que pelean en varios combates', () => {
      const event = makeEvent({ matches: [makeMatch({ id: 'a' }), makeMatch({ id: 'b' })] });
      expect(emitted(buildSportsEventJsonLd(event, SITE))['competitor']).toHaveSize(2);
    });

    it('debe omitir imagen y oferta si no existen, y no marcar título en combates normales', () => {
      const ld = emitted(buildSportsEventJsonLd(makeEvent({ image: undefined, tickets: undefined, matches: [makeMatch()] }), ''));

      expect(ld['image']).toBeUndefined();
      expect(ld['offers']).toBeUndefined();
      expect(ld['organizer']['url']).toBeUndefined();
      expect(ld['subEvent'][0]['name']).toBe('Rojo Test vs Azul Test');
    });
  });

  describe('buildNewsArticleJsonLd', () => {
    const article: NewsArticleInput = {
      headline: 'x'.repeat(130),
      description: 'Crónica del evento',
      path: '/blog/cronica',
      datePublished: '2030-01-02T10:00:00-05:00',
      authorName: 'Redacción',
      image: { src: 'assets/cronica.jpg', width: 1200, height: 630, alt: 'Crónica' }
    };

    it('debe generar un NewsArticle con titular de máximo 110 caracteres y publisher', () => {
      const ld = emitted(buildNewsArticleJsonLd({ ...article, about: makeEvent() }, SITE));

      expect(ld['@type']).toBe('NewsArticle');
      expect(ld['headline']).toHaveSize(110);
      expect(ld['mainEntityOfPage']).toBe('https://www.ejemplo.pe/blog/cronica');
      expect(ld['image']).toEqual(['https://www.ejemplo.pe/assets/cronica.jpg']);
      expect(ld['dateModified']).toBe(article.datePublished);
      expect(ld['publisher']['logo']['url']).toBe('https://www.ejemplo.pe/assets/cona_logo.png');
      expect(ld['about']).toEqual({ '@type': 'SportsEvent', name: 'Evento Test', startDate: '2030-01-01T20:00:00-05:00' });
    });

    it('debe respetar dateModified y omitir about si no se indica', () => {
      const ld = emitted(buildNewsArticleJsonLd({ ...article, dateModified: '2030-01-03T00:00:00-05:00' }, SITE));

      expect(ld['dateModified']).toBe('2030-01-03T00:00:00-05:00');
      expect(ld['about']).toBeUndefined();
    });
  });
});
