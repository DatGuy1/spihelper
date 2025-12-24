import type { BunPlugin } from 'bun';

// We use this to prevent bun from bundling in all of Vue just to get defineComponent
export const defineComponentPlugin: BunPlugin = {
  name: 'defineComponent plugin',
  setup(build) {
    build.onLoad({ filter: /vue\.runtime/, namespace: 'file' }, () => {
      return {
        contents: 'export const defineComponent = (c) => c;',
        loader: 'ts',
      };
    });
  },
};
