import { build } from 'esbuild';
import path from 'node:path';

// Preserve the cascade, media queries and asset URLs across source directories.
await build({
  entryPoints: ['home-layout','interior-layout','illustrations-layout'].map(name => 'design/' + name + '.css'),
  outdir: 'assets',
  bundle: true,
  minifyWhitespace: true,
  plugins: [{
    name: 'preserve-public-urls',
    setup(builder) {
      builder.onResolve({filter:/.*/}, args => {
        if (args.kind !== 'url-token') return;
        const url = args.path;
        if (/^(?:[a-z]+:|\/|#)/i.test(url)) return {path:url,external:true};
        const relative = path.relative('assets', path.resolve(args.resolveDir, url));
        return {path:relative.split(path.sep).join('/'),external:true};
      });
    }
  }]
});
