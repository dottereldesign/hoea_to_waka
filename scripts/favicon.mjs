import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const sharp = createRequire(import.meta.url)('sharp');

// Fill the browser's tiny icon slot with the approved mark, without a tile or border.
const logo = await readFile(new URL('../assets/logo-black.svg', import.meta.url), 'utf8');
const paths = logo.replace(/^[\s\S]*?<svg\b[^>]*>/, '').replace(/<\/svg>\s*$/, '');
const light = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 385 384">\n${paths}</svg>\n`;
const dark = light.replaceAll('fill="#191919"', 'fill="#fff"');
const adaptive = light.replace('>\n', '>\n  <style>@media(prefers-color-scheme:dark){path{fill:#fff}}</style>\n');
await writeFile(new URL('../assets/favicon.svg', import.meta.url), adaptive);
await writeFile(new URL('../assets/favicon-light.svg', import.meta.url), light);
await writeFile(new URL('../assets/favicon-dark.svg', import.meta.url), dark);
await sharp(Buffer.from(light)).png().toFile(fileURLToPath(new URL('../assets/favicon.png', import.meta.url)));
// Home-screen icons need a separate opaque surface; browser favicons stay transparent.
const touch = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 512 512"><rect width="512" height="512" fill="#fff"/><svg x="48" y="48" width="416" height="416" viewBox="0 0 385 384">${paths}</svg></svg>`;
await sharp(Buffer.from(touch)).png().toFile(fileURLToPath(new URL('../assets/brand-downloads/hoea-to-waka-apple-touch-icon.png', import.meta.url)));
