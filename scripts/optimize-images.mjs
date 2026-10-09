// Genera variantes WebP responsivas de las imágenes de src/assets y su manifiesto tipado.
// Uso: npm run images   (volver a ejecutar cuando se añadan o cambien imágenes)
import { mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { extname, join, parse } from 'node:path';
import sharp from 'sharp';

const SOURCE_DIR = 'src/assets';
const OUTPUT_DIR = 'src/assets/optimized';
const MANIFEST = 'src/app/shared/images/image-manifest.ts';
/** Anchos alineados con los breakpoints de NgOptimizedImage (IMAGE_CONFIG). */
const BREAKPOINTS = [96, 160, 320, 480, 640, 828, 1080, 1280, 1600, 1920];
const RASTER = new Set(['.jpg', '.jpeg', '.png', '.webp']);

await rm(OUTPUT_DIR, { recursive: true, force: true });
await mkdir(OUTPUT_DIR, { recursive: true });

const files = (await readdir(SOURCE_DIR, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && RASTER.has(extname(entry.name).toLowerCase()))
  .map((entry) => entry.name)
  .sort();

const manifest = {};
let before = 0;
let after = 0;

for (const file of files) {
  const input = join(SOURCE_DIR, file);
  const { name } = parse(file);
  const image = sharp(input);
  const { width } = await image.metadata();
  const { size } = await stat(input);
  const maxWidth = Math.min(width, BREAKPOINTS.at(-1));
  const widths = [...new Set([...BREAKPOINTS.filter((w) => w < maxWidth), maxWidth])];
  // PNG suele ser texto/gráfico (horario, logo): más calidad para no emborronar.
  const quality = extname(file).toLowerCase() === '.png' ? 85 : 72;

  for (const w of widths) {
    const info = await sharp(input)
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality, effort: 5 })
      .toFile(join(OUTPUT_DIR, `${name}-${w}.webp`));
    if (w === widths.at(-1)) {
      after += info.size;
    }
  }
  before += size;
  manifest[name] = widths;
  console.log(`${file.padEnd(20)} ${width}px -> ${widths.join(', ')}`);
}

const banner = '// ARCHIVO GENERADO por scripts/optimize-images.mjs: no editar a mano.\n';
await writeFile(
  MANIFEST,
  `${banner}\nexport const IMAGE_BREAKPOINTS: readonly number[] = [${BREAKPOINTS.join(', ')}];\n\n` +
    `/** Anchos disponibles (ascendentes) de cada imagen en assets/optimized. */\n` +
    `export const IMAGE_WIDTHS: Readonly<Record<string, readonly number[]>> = {\n` +
    Object.entries(manifest)
      .map(([key, widths]) => `  '${key}': [${widths.join(', ')}]`)
      .join(',\n') +
    `\n};\n`
);

console.log(`\n${files.length} imágenes · originales ${(before / 1024).toFixed(0)} KB -> mayor variante ${(after / 1024).toFixed(0)} KB`);
