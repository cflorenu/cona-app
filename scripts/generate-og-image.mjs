// Genera la imagen para compartir en redes (Open Graph, 1200x630) con la marca de la academia.
// Uso: node scripts/generate-og-image.mjs   (volver a ejecutar si cambian logo, colores o textos)
import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const WIDTH = 1200;
const HEIGHT = 630;
const OUTPUT = 'src/assets/og/og-default.jpg';

const background = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#4b0082"/>
      <stop offset="1" stop-color="#26003f"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect x="0" y="${HEIGHT - 14}" width="${WIDTH}" height="14" fill="#ffc107"/>
  <text x="430" y="250" font-family="Arial Black, Arial, sans-serif" font-size="96" font-weight="900" fill="#ffc107">CON</text>
  <text x="430" y="350" font-family="Arial Black, Arial, sans-serif" font-size="96" font-weight="900" fill="#ffffff">ATLETAS SUR</text>
  <text x="432" y="420" font-family="Segoe UI, Arial, sans-serif" font-size="34" fill="#e9dcf5">Artes marciales en Villa El Salvador</text>
  <text x="432" y="480" font-family="Segoe UI, Arial, sans-serif" font-size="28" fill="#ffc107">Lunes a sábado · 6:30 – 9:00 p. m.</text>
</svg>`);

const logo = await sharp('src/assets/cona_logo.png').resize(300, 300, { fit: 'contain', background: '#ffffff00' }).toBuffer();
const badge = await sharp({
  create: { width: 340, height: 340, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } }
})
  .composite([
    { input: Buffer.from('<svg width="340" height="340"><circle cx="170" cy="170" r="170"/></svg>'), blend: 'dest-in' },
    { input: logo, top: 20, left: 20 }
  ])
  .png()
  .toBuffer();

await mkdir('src/assets/og', { recursive: true });
const info = await sharp(background)
  .composite([{ input: badge, top: 140, left: 60 }])
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(OUTPUT);

console.log(`${OUTPUT}: ${info.width}x${info.height}, ${(info.size / 1024).toFixed(0)} KB`);
