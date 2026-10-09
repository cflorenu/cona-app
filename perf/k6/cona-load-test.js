/**
 * Pruebas de rendimiento de cona-app con k6 (https://grafana.com/docs/k6/).
 *
 * La aplicación es una SPA estática: lo crítico es el hosting/CDN (documento HTML, bundles JS/CSS,
 * imágenes y video) y, opcionalmente, el endpoint de contacto si se migra a un backend propio.
 *
 * Uso:
 *   k6 run -e BASE_URL=https://staging.conatletas.pe -e PROFILE=smoke  perf/k6/cona-load-test.js
 *   k6 run -e BASE_URL=https://staging.conatletas.pe -e PROFILE=load   perf/k6/cona-load-test.js
 *   k6 run -e BASE_URL=https://staging.conatletas.pe -e PROFILE=stress perf/k6/cona-load-test.js
 *   k6 run -e BASE_URL=https://staging.conatletas.pe -e PROFILE=spike  perf/k6/cona-load-test.js
 *   k6 run -e BASE_URL=https://staging.conatletas.pe -e PROFILE=soak   perf/k6/cona-load-test.js
 *
 * Variables opcionales:
 *   CONTACT_URL=https://mock.interno/contact  Activa el escenario del formulario (NUNCA Formspree en producción).
 *   CHECK_CACHE=true                          Exige Cache-Control de larga duración en los bundles con hash.
 *
 * Ejecutar SIEMPRE contra un entorno propio (staging) y nunca contra servicios de terceros sin autorización.
 */
import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { parseHTML } from 'k6/html';
import { Rate, Trend } from 'k6/metrics';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';

const BASE_URL = (__ENV.BASE_URL || 'http://localhost:4200').replace(/\/$/, '');
const PROFILE = __ENV.PROFILE || 'smoke';
const CONTACT_URL = __ENV.CONTACT_URL || '';
const CHECK_CACHE = __ENV.CHECK_CACHE === 'true';

if (/formspree\.io/i.test(CONTACT_URL)) {
  throw new Error('CONTACT_URL apunta a Formspree: no está permitido estresar un servicio de terceros. Usa un mock.');
}

const SPA_ROUTES = ['/', '/blog', '/clase-privada', '/biography'];
const HOME_IMAGES = ['assets/jiu-jitsu.jpg', 'assets/muay-thai.jpg', 'assets/sambo.jpg', 'assets/boxeo.jpg'];
const HERO_VIDEO = 'assets/wrestling.mp4';
const VIDEO_FIRST_CHUNK = 'bytes=0-1048575'; // primer MB, como hace el navegador al iniciar la reproducción

const cacheableStaticAssets = new Rate('cacheable_static_assets');
const journeyDuration = new Trend('journey_duration', true);

// ---------------------------------------------------------------------------------------------
// Perfiles de carga
// ---------------------------------------------------------------------------------------------
const visitorProfiles = {
  smoke: { executor: 'constant-vus', vus: 2, duration: '1m' },
  load: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '2m', target: 50 },
      { duration: '10m', target: 50 },
      { duration: '2m', target: 0 }
    ]
  },
  stress: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '3m', target: 100 },
      { duration: '5m', target: 200 },
      { duration: '5m', target: 400 },
      { duration: '3m', target: 0 }
    ]
  },
  spike: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '1m', target: 10 },
      { duration: '30s', target: 500 },
      { duration: '2m', target: 500 },
      { duration: '30s', target: 10 },
      { duration: '1m', target: 0 }
    ]
  },
  soak: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '5m', target: 50 },
      { duration: '2h', target: 50 },
      { duration: '5m', target: 0 }
    ]
  }
};

if (!visitorProfiles[PROFILE]) {
  throw new Error(`PROFILE inválido "${PROFILE}". Usa: ${Object.keys(visitorProfiles).join(', ')}`);
}

const scenarios = {
  visitors: { ...visitorProfiles[PROFILE], exec: 'browseSite', tags: { scenario: 'visitors' } }
};

if (CONTACT_URL) {
  scenarios.contact_form = {
    executor: 'constant-arrival-rate',
    rate: PROFILE === 'smoke' ? 1 : 5, // envíos por segundo
    timeUnit: '1s',
    duration: PROFILE === 'soak' ? '2h' : '10m',
    preAllocatedVUs: 10,
    maxVUs: 50,
    exec: 'submitContactForm',
    tags: { scenario: 'contact_form' }
  };
}

// ---------------------------------------------------------------------------------------------
// Umbrales de aceptación (SLO)
// ---------------------------------------------------------------------------------------------
const thresholds = {
  http_req_failed: [{ threshold: 'rate<0.01', abortOnFail: PROFILE !== 'stress' && PROFILE !== 'spike' }],
  checks: ['rate>0.99'],
  'http_req_duration{type:document}': ['p(95)<200', 'p(99)<500'],
  'http_req_duration{type:static}': ['p(95)<300', 'p(99)<800'],
  'http_req_duration{type:image}': ['p(95)<500'],
  'http_req_waiting{type:media}': ['p(95)<300'], // TTFB del video (el tamaño total depende del ancho de banda)
  journey_duration: ['p(95)<3000']
};

if (CONTACT_URL) {
  thresholds['http_req_duration{type:contact}'] = ['p(95)<800', 'p(99)<1500'];
  thresholds['http_req_failed{type:contact}'] = ['rate<0.01'];
}
if (CHECK_CACHE) {
  thresholds.cacheable_static_assets = ['rate>0.99'];
}

export const options = {
  scenarios,
  thresholds,
  insecureSkipTLSVerify: false,
  userAgent: 'k6-cona-perf/1.0',
  summaryTrendStats: ['avg', 'min', 'med', 'p(90)', 'p(95)', 'p(99)', 'max']
};

// ---------------------------------------------------------------------------------------------
// Setup: descubre los bundles con hash desde index.html (cambian en cada build)
// ---------------------------------------------------------------------------------------------
export function setup() {
  const res = http.get(`${BASE_URL}/`, { tags: { type: 'document', name: 'setup-index' } });
  if (res.status !== 200) {
    throw new Error(`No se pudo cargar ${BASE_URL}/ (status ${res.status}). ¿La URL es correcta?`);
  }

  const doc = parseHTML(res.body);
  const assets = [];
  doc.find('script[src]').each((_, el) => assets.push(el.attributes().src.value));
  doc.find('link[rel="stylesheet"][href], link[rel="modulepreload"][href]').each((_, el) =>
    assets.push(el.attributes().href.value)
  );

  const unique = [...new Set(assets)].filter((url) => !/^https?:\/\//.test(url));
  if (unique.length === 0) {
    throw new Error('index.html no referencia bundles locales; revisa el build desplegado.');
  }
  return { staticAssets: unique };
}

const absolute = (path) => `${BASE_URL}/${path.replace(/^\//, '')}`;
const thinkTime = () => sleep(1 + Math.random() * 3);

const THIRTY_DAYS_S = 30 * 24 * 60 * 60;
function isLongLivedCache(cacheControl = '') {
  if (/immutable/i.test(cacheControl)) return true;
  const maxAge = /max-age=(\d+)/i.exec(cacheControl);
  return maxAge !== null && Number(maxAge[1]) >= THIRTY_DAYS_S;
}

// ---------------------------------------------------------------------------------------------
// Escenario 1: visitante navegando la SPA (documento + bundles + imágenes + video)
// ---------------------------------------------------------------------------------------------
export function browseSite(data) {
  const start = Date.now();

  group('01_landing', () => {
    const doc = http.get(`${BASE_URL}/`, { tags: { type: 'document', name: 'GET /' } });
    check(doc, {
      'landing 200': (r) => r.status === 200,
      'landing contiene <app-root>': (r) => r.body.includes('<app-root'),
      'landing con compresión': (r) => /gzip|br|zstd/.test(r.headers['Content-Encoding'] || '')
    });

    const staticResponses = http.batch(
      data.staticAssets.map((path) => ['GET', absolute(path), null, { tags: { type: 'static', name: 'bundle' }, responseType: 'none' }])
    );
    staticResponses.forEach((r) => {
      check(r, { 'bundle 200': (res) => res.status === 200 });
      cacheableStaticAssets.add(isLongLivedCache(r.headers['Cache-Control']));
    });

    const media = http.batch([
      ...HOME_IMAGES.map((img) => ['GET', absolute(img), null, { tags: { type: 'image', name: 'home-image' }, responseType: 'none' }]),
      [
        'GET',
        absolute(HERO_VIDEO),
        null,
        { headers: { Range: VIDEO_FIRST_CHUNK }, tags: { type: 'media', name: 'hero-video' }, responseType: 'none' }
      ]
    ]);
    media.forEach((r) => check(r, { 'media 200/206': (res) => res.status === 200 || res.status === 206 }));
  });

  thinkTime();

  group('02_deep_links', () => {
    // Las rutas profundas deben devolver su HTML prerenderizado (blog/index.html, etc.), no 404.
    const route = SPA_ROUTES[1 + Math.floor(Math.random() * (SPA_ROUTES.length - 1))];
    const res = http.get(`${BASE_URL}${route}`, { tags: { type: 'document', name: 'GET /:route' } });
    check(res, {
      'deep link 200 (SPA fallback)': (r) => r.status === 200,
      'deep link prerenderizado (contenido en el HTML, no solo <app-root>)': (r) => /<h1[^>]*>/.test(r.body)
    });
  });

  thinkTime();

  group('03_unknown_route', () => {
    // El hosting devuelve un 404 real con la página 404 prerenderizada (no cuenta como error HTTP).
    const res = http.get(`${BASE_URL}/ruta-inexistente-${__VU}`, {
      tags: { type: 'document', name: 'GET /unknown' },
      responseCallback: http.expectedStatuses(404)
    });
    check(res, {
      'ruta desconocida devuelve 404 real': (r) => r.status === 404,
      'ruta desconocida muestra la página 404': (r) => r.body.includes('Error 404')
    });
  });

  journeyDuration.add(Date.now() - start);
  thinkTime();
}

// ---------------------------------------------------------------------------------------------
// Escenario 2: envío del formulario de contacto (solo contra un mock/backend propio)
// ---------------------------------------------------------------------------------------------
export function submitContactForm() {
  const id = `${__VU}-${__ITER}-${Date.now()}`;
  const payload = JSON.stringify({
    nombre_completo: `k6 Usuario ${id}`,
    _replyto: `k6+${id}@example.com`,
    telefono: '987654321',
    codigo_pais: '+51',
    mensaje: 'Mensaje generado por prueba de carga k6.',
    _gotcha: ''
  });

  const res = http.post(CONTACT_URL, payload, {
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    tags: { type: 'contact', name: 'POST /contact' },
    timeout: '10s'
  });

  check(res, {
    'contacto 2xx': (r) => r.status >= 200 && r.status < 300,
    'contacto no rate-limited': (r) => r.status !== 429
  });
}

export function handleSummary(data) {
  return {
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
    [`k6-summary-${PROFILE}.json`]: JSON.stringify(data, null, 2)
  };
}
