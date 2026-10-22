import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const sharp = createRequire(import.meta.url)('sharp');

// Build the favicon from the approved vector mark, without a decorative baseline.
const logo = await readFile(new URL('../assets/logo-black.svg', import.meta.url), 'utf8');
const paths = logo.replace(/^[\s\S]*?<svg\b[^>]*>/, '').replace(/<\/svg>\s*$/, '');
const light = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect x="12" y="12" width="488" height="488" rx="110" fill="#fff" stroke="#d7dfe4" stroke-width="16"/>
  <svg x="95" y="101" width="320" height="320" viewBox="0 0 385 384">${paths}</svg>
</svg>\n`;
const dark = light.replace('fill="#fff" stroke="#d7dfe4"', 'fill="#191919" stroke="#41454b"').replaceAll('fill="#191919"/>', 'fill="#fff"/>');
const adaptive = light.replace('>\n', '>\n  <style>@media(prefers-color-scheme:dark){rect{fill:#191919;stroke:#41454b}path{fill:#fff}}</style>\n');
await writeFile(new URL('../assets/favicon.svg', import.meta.url), adaptive);
await writeFile(new URL('../assets/favicon-light.svg', import.meta.url), light);
await writeFile(new URL('../assets/favicon-dark.svg', import.meta.url), dark);
await sharp(Buffer.from(light)).png().toFile(fileURLToPath(new URL('../assets/favicon.png', import.meta.url)));
