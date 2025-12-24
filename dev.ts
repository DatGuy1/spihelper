// build.ts
import { watch } from 'fs';
import { resolve } from 'path';
import { codename, version } from './package.json';
import { defineComponentPlugin } from './plugin.ts';

async function build() {
  log('Building...');
  const result = await Bun.build({
    entrypoints: ['src/spihelper.ts', 'src/spihelper.css'],
    outdir: './dist',
    minify: false, // Don't minify in dev mode for easier debugging
    sourcemap: 'external',
    target: 'browser',
    plugins: [defineComponentPlugin],
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
    const contentType = url.pathname.endsWith('.js') ? 'application/javascript' : url.pathname.endsWith('.css') ? 'text/css' : 'text/plain';

    return new Response(file, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': contentType,
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
  (_event, filename) => {
    if (filename?.endsWith('.ts') || filename?.endsWith('.css')) {
      log(`${filename} changed, rebuilding...`);
      void build();
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
