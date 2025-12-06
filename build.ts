import { codename, version } from './package.json';

await Bun.build({
  entrypoints: ['src/spihelper.ts'],
  outdir: './dist',
  minify: true,
  sourcemap: 'none',
  target: 'browser',
  format: 'iife',
  define: {
    __CODENAME__: JSON.stringify(codename),
    __VERSION__: JSON.stringify(version),
  },
  banner: `/* v${version} "${codename}" */`,
});
