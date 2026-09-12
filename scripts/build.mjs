import { build } from 'esbuild';
import { copyFile } from 'node:fs/promises';
await build({ entryPoints: ['design/studio.jsx'], bundle: true, minify: true, format: 'iife', target: ['es2020'], outfile: 'assets/design-studio.js', define: { 'process.env.NODE_ENV': '"production"' }, legalComments: 'linked' });
await copyFile('design/studio.css','assets/design-studio.css');
await copyFile('design/LICENSE-MOTION-PRIMITIVES.txt','assets/LICENSE-MOTION-PRIMITIVES.txt');
