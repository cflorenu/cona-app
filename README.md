# Con Atletas Sur · cona-app

Sitio web de la academia de artes marciales **Con Atletas Sur** (Villa El Salvador, Lima).
SPA en **Angular 22** (zoneless, componentes standalone) con prerenderizado estático para SEO,
desplegada como sitio estático en Hostinger (Apache/LiteSpeed).

## Requisitos

- Node.js 22 y npm
- Google Chrome (para los tests con Karma y Lighthouse CI)

## Comandos

| Comando | Descripción |
|---|---|
| `npm start` | Servidor de desarrollo en `http://localhost:4200` (incluye la vista previa `/eventos`) |
| `npm run build` | Build de producción con prerender en `dist/cona-app/browser`; genera además `robots.txt` y `sitemap.xml` |
| `npm run test:ci` | Tests unitarios en Chrome headless; **falla si la cobertura baja del 100 %** |
| `npm run e2e` | Tests end-to-end con Playwright sobre el build (escritorio y móvil, usa el Chrome instalado) |
| `npm run lint` | ESLint (TypeScript + plantillas, con reglas de accesibilidad) |
| `npm run images` | Regenera las variantes WebP responsivas de `src/assets` (ejecutar al añadir o cambiar imágenes) |
| `npm run og-image` | Regenera la imagen para compartir en redes (`src/assets/og/og-default.jpg`) |
| `npm run mock:live` | Servidor SSE de prueba para el play-by-play en vivo (`http://localhost:3001/live`) |

## Estructura

```
src/app/
├── components/        Header, footer, formulario de contacto, modal de clase gratis
├── pages/             Páginas: inicio, blog, biografía, clase privada, portal del alumno, privacidad, 404
├── features/
│   └── fight-night/   Eventos y roster: cartelera, perfil de luchador, countdown, ticker en vivo
├── services/          Acceso a datos (Formspree) y estado compartido
└── shared/
    ├── analytics/     Medición de conversiones sin cookies (Plausible)
    ├── data/          Datos de dominio (disciplinas, horario, contacto)
    ├── images/        Loader de NgOptimizedImage y manifiesto de variantes
    ├── media/         Reproductores: fachada YouTube/Twitch y HLS
    ├── performance/   Prefetch por intención y precarga de fuentes
    ├── schedule/      Horario de clases en HTML
    └── seo/           JSON-LD (Schema.org) y metadatos Open Graph (solo en el prerender)
```

## Configuración

Las variables están en `src/environments/`:

- `contactFormEndpoint`: formulario de Formspree.
- `siteUrl`: dominio público. Necesario para las URLs absolutas del JSON-LD, la imagen de Open Graph, la URL canónica y `sitemap.xml` (el build también acepta la variable `SITE_URL`).
- `analytics.plausibleDomain`: activa la analítica sin cookies (vacío = desactivada). Al activarla, añadir `https://plausible.io` a `script-src` y `connect-src` de la CSP.
- `liveFeedUrl`: endpoint SSE de resultados en vivo (vacío = desactivado).
- `features.eventsPreview`: activa `/eventos` con datos de demostración (solo desarrollo).

La paleta de marca (`--brand-*`) está centralizada en `src/styles.scss`.
El horario de clases se edita en `src/app/shared/data/schedule.ts` (lo usan la web y el JSON-LD).

## Despliegue

1. `npm run build`
2. Subir el contenido de `dist/cona-app/browser` (incluido `.htaccess`) a `public_html`.

El `.htaccess` configura HTTPS, rutas prerenderizadas, 404 real, caché, compresión y cabeceras de seguridad (CSP, HSTS).
Al añadir orígenes externos (stream, API) hay que incluirlos en la CSP.

## Integración continua

`.github/workflows/ci.yml` ejecuta lint, tests con cobertura, build, tests end-to-end y Lighthouse CI en cada push y pull request.
También se lanza con `repository_dispatch` (`content-published`) para reconstruir al publicar contenido.
El despliegue por FTPS queda inactivo hasta definir la variable `DEPLOY_ENABLED=true` y los secretos
`FTP_SERVER`, `FTP_USERNAME` y `FTP_PASSWORD`.

## Pruebas de carga

Script k6 en `perf/k6/cona-load-test.js` (perfiles `smoke`, `load`, `stress`, `spike` y `soak`):

```bash
k6 run -e BASE_URL=https://staging.tu-dominio -e PROFILE=load perf/k6/cona-load-test.js
```

Ejecutar siempre contra un entorno propio, nunca contra servicios de terceros.
