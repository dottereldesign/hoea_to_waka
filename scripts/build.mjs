import { build } from 'esbuild';
import { copyFile, readFile, writeFile } from 'node:fs/promises';
await build({ entryPoints: ['design/studio.jsx'], bundle: true, minify: true, format: 'iife', target: ['es2020'], outfile: 'assets/design-studio.js', define: { 'process.env.NODE_ENV': '"production"' }, legalComments: 'linked' });
await writeFile('assets/design-studio.css',await readFile('design/studio.css','utf8')+'\n'+await readFile('design/extended.css','utf8'));
await copyFile('design/LICENSE-MOTION-PRIMITIVES.txt','assets/LICENSE-MOTION-PRIMITIVES.txt');
