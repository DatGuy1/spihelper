import { codename, version } from './package.json';
import { VueImportPlugin } from './plugin.ts';

await Bun.build({
  entrypoints: ['src/spihelper.ts', 'src/spihelper.css'],
  outdir: './dist',
  minify: true,
  sourcemap: 'none',
  target: 'browser',
  plugins: [VueImportPlugin],
  format: 'iife',
  define: {
    __CODENAME__: JSON.stringify(codename),
    __VERSION__: JSON.stringify(version),
    __MODE__: '"production"',
  },
  banner: `/* v${version} "${codename}" */`,
});
