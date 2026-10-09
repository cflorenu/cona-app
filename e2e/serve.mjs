// Servidor estático para los tests E2E: replica el .htaccess de producción
// (rutas prerenderizadas, 404 real y la misma Content-Security-Policy).
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve } from 'node:path';

const ROOT = resolve('dist/cona-app/browser');
const PORT = Number(process.env.PORT ?? 4300);

const htaccess = readFileSync(join(ROOT, '.htaccess'), 'utf8');
// upgrade-insecure-requests forzaría HTTPS en localhost.
const csp = /Content-Security-Policy "([^"]+)"/.exec(htaccess)[1].replace('; upgrade-insecure-requests', '');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm'
};

const isFile = (path) => path.startsWith(ROOT) && existsSync(path) && statSync(path).isFile();

createServer((req, res) => {
  const url = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const target = join(ROOT, url);
  let file = target;
  let status = 200;
  if (!isFile(file)) {
    file = join(target, 'index.html');
  }
  if (!isFile(file)) {
    file = join(ROOT, 'not-404', 'index.html');
    status = 404;
  }
  res.writeHead(status, {
    'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream',
    'Content-Security-Policy': csp
  });
  createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`E2E: sirviendo ${ROOT} en http://localhost:${PORT}`));
