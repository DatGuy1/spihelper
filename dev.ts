// build.ts
import { watch } from 'fs';
import { resolve } from 'path';
import { codename, version } from './package.json';

async function build() {
  log('Building...');
  const result = await Bun.build({
    entrypoints: ['src/spihelper.ts'],
    outdir: './dist',
    minify: false, // Don't minify in dev mode for easier debugging
    sourcemap: 'external',
    target: 'browser',
    format: 'iife',
    define: {
      __CODENAME__: JSON.stringify(codename),
      __VERSION__: JSON.stringify(version),
    },
    banner: `/* v${version} "${codename}" */`,
  });

  if (!result.success) {
    console.error('Build failed');
    result.logs.forEach(log => console.error(log));
  }
  else {
    log('Build complete!');
  }
}

// Initial build
await build();

// Start dev server
const server = Bun.serve({
  port: 8080,
  fetch(req) {
    const url = new URL(req.url);
    const filePath = resolve('./dist' + url.pathname);

    const file = Bun.file(filePath);

    return new Response(file, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': url.pathname.endsWith('.js')
          ? 'application/javascript'
          : 'text/plain',
      },
    });
  },
});

log(`Dev server running at http://localhost:${server.port}`);
log('Watching for changes...');

// Watch for file changes
const watcher = watch(
  './src',
  { recursive: true },
  async (_event, filename) => {
    if (filename?.endsWith('.ts')) {
      log(`${filename} changed, rebuilding...`);
      await build();
    }
  },
);

// Keep process alive
process.on('SIGINT', () => {
  log('\nShutting down...');
  watcher.close();
  void server.stop();
  process.exit(0);
});

function log(message: string): void {
  console.log(`[${Date.now()}] ${message}`);
}
