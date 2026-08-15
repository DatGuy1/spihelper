import { version } from './package.json';
import { VueImportPlugin } from './plugin.ts';
import { readFileSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';

const branch = process.env.GITHUB_REF_NAME ?? 'develop'; // "stable" or "develop"
const buildRef = `refs/heads/build/${branch}`;
const mode = branch === 'stable' ? 'production' : 'dev';

const versionBanner = `v${version}`;

const usyncTemplateJs = `{{Wikipedia:USync|repo=https://github.com/DatGuy1/spihelper|ref=${buildRef}|path=spihelper.js}}`;

rmSync('dist', { recursive: true, force: true });

await Bun.build({
  entrypoints: ['src/spihelper.ts', 'src/spihelper.css'],
  outdir: './dist',
  minify: mode === 'production',
  sourcemap: 'none', // We might like to make this 'inline' for dev
  target: 'browser',
  plugins: [VueImportPlugin(mode === 'production')],
  format: 'iife',
  define: {
    __VERSION__: JSON.stringify(version),
    __MODE__: `"${mode}"`,
  },
  banner: '// ' + usyncTemplateJs + '\n// ' + versionBanner + '\n// <nowiki>' + '\n\'use strict\';',
  footer: '// </nowiki>',
});

// Prepend CSS banner manually since Bun doesn't
const cssPath = join('dist', 'spihelper.css');
const bannerCSS = `/* {{Wikipedia:USync|repo=https://github.com/DatGuy1/spihelper|ref=${buildRef}|path=spihelper.css}} */\n/* ${versionBanner} */\n`;

const cssContent = readFileSync(cssPath, 'utf-8');
writeFileSync(cssPath, bannerCSS + cssContent, 'utf-8');
