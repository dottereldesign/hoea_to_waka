import {cp, mkdir, readFile, rm, lstat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, '_site');
const exclude = new Set(JSON.parse(await readFile(new URL('public-exclusions.json', import.meta.url), 'utf8')));
const entries = [
  'index.html', '404.html', 'site.js', 'styles.css', 'contact.js', 'robots.txt', 'sitemap.xml', '_redirects', '_headers',
  'brand-guidelines.html', 'contact.html', 'in-house-workshops.html', 'individual-coaching.html',
  'resources.html', 'services.html', 'support-professionals.html', 'assets', 'model', 'services', 'resources',
  'contact', 'illustrations', 'prompts', 'colour-testing', 'about/index.html', 'about/brand-guidelines'
];

// Only clean the fixed, generated release directory inside this checkout.
const previous = await lstat(output).catch(error => {
  if (error.code !== 'ENOENT') throw error;
});
if (previous && (!previous.isDirectory() || previous.isSymbolicLink())) throw Error('Unexpected _site output path');
await rm(output, {recursive:true, force:true});
await mkdir(path.join(output, 'about'), {recursive:true});
for (const entry of entries) {
  await cp(path.join(root, entry), path.join(output, entry), {
    recursive:true,
    async filter(source) {
      const name = path.relative(root, source).split(path.sep).join('/');
      if (exclude.has(name) || path.basename(source).startsWith('.')) return false;
      if ((await lstat(source)).isSymbolicLink()) throw Error('Unexpected public symlink: ' + name);
      return true;
    }
  });
}
console.log('Staged the public release in _site.');
