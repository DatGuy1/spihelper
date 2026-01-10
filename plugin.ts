import type { BunPlugin } from 'bun';

// We use this to prevent bun from bundling in all of Vue just to get defineComponent
export const VueImportPlugin: BunPlugin = {
  name: 'Vue import plugin',
  setup(build) {
    build.onLoad({ filter: /vue\.runtime/, namespace: 'file' }, () => {
      return {
        contents: 'export const defineComponent = (c) => c;',
        loader: 'ts',
      };
    });
  },
};
