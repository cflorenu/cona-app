// Genera robots.txt y sitemap.xml en el build a partir de las páginas prerenderizadas.
// Se ejecuta solo tras `npm run build` (script postbuild). Dominio: SITE_URL o `siteUrl` de environment.ts.
import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const DIST = 'dist/cona-app/browser';
const EXCLUDED = new Set(['not-404', 'eventos']);

const environment = await readFile('src/environments/environment.ts', 'utf8');
const siteUrl = (process.env.SITE_URL ?? /siteUrl:\s*'([^']*)'/.exec(environment)?.[1] ?? '').replace(/\/+$/, '');

/** Rutas con index.html prerenderizado (excepto 404 y vistas de desarrollo). */
const findPages = async (dir) => {
  const pages = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      pages.push(...(await findPages(full)));
    } else if (entry.name === 'index.html') {
      const route = relative(DIST, dir).split(sep).join('/');
      if (!EXCLUDED.has(route)) {
        pages.push({ route, lastmod: (await stat(full)).mtime.toISOString().slice(0, 10) });
      }
    }
  }
  return pages;
};

const pages = (await findPages(DIST)).sort((a, b) => a.route.localeCompare(b.route));

const robots = ['User-agent: *', 'Allow: /', 'Disallow: /not-404/'];
if (siteUrl) {
  robots.push('', `Sitemap: ${siteUrl}/sitemap.xml`);
}
await writeFile(join(DIST, 'robots.txt'), robots.join('\n') + '\n');

if (siteUrl) {
  const urls = pages
    .map(({ route, lastmod }) => {
      const loc = route ? `${siteUrl}/${route}` : `${siteUrl}/`;
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <priority>${route ? '0.8' : '1.0'}</priority>\n  </url>`;
    })
    .join('\n');
  await writeFile(
    join(DIST, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
  );
  console.log(`robots.txt y sitemap.xml generados (${pages.length} páginas) para ${siteUrl}`);
} else {
  console.warn('robots.txt generado. sitemap.xml omitido: define siteUrl en environment.ts o la variable SITE_URL.');
}
