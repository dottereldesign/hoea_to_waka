import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

// These shared files must keep the same cache key on every entry route.
const assets = [
  'home-layout.css', 'interior-layout.css', 'illustrations-layout.css', 'footer-credit.css', 'motion-sections.js', 'music-player.css', 'solid-subpage-headers.css',
  'support-role-layouts.css', 'brand-door.js', 'home-services-reveal.js', 'guide-init.js',
  'anna-timelines-runtime.js', 'hero-sun.css', 'hero-gallery-reveal.js', 'theme-init.js',
  'site-interactions.js', 'logo-construction.js', 'coaching-outcomes.js', 'nearby-scripts.js'
];
const versions = new Map();
for (const name of assets) {
  const content = (await readFile(path.join('assets', name), 'utf8')).replaceAll('\r\n', '\n');
  versions.set(name, createHash('sha256').update(content).digest('hex').slice(0, 12));
}
async function update(file) {
  const html = await readFile(file, 'utf8');
  const next = html.replace(/((?:href|src)="(?:\.\.\/)*assets\/)([\w-]+\.(?:css|js))(?:\?v=[^"#]*)?"/g,
    (tag, prefix, name) => versions.has(name) ? prefix + name + '?v=' + versions.get(name) + '"' : tag);
  if (next !== html) await writeFile(file, next);
}
for (const page of ['index.html','404.html','pages/home.html','brand/brand-system.html']) await update(page);
for (const dir of ['about','contact','model','resources','illustrations','services','prompts']) {
  for (const file of await readdir(dir,{recursive:true})) {
    if (path.basename(file) === 'index.html') await update(path.join(dir,file));
  }
}
