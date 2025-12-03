await Bun.build({
    entrypoints: ['src/spihelper.ts'],
    outdir: './dist',
    minify: true
});