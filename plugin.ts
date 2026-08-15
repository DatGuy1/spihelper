import type { BunPlugin } from 'bun';

/**
 * Strip source indentation out of `template:` literals.
 *
 * Vue templates are plain strings, so the minifier can't touch them and every level of
 * source indentation ships to the reader. Newlines are kept deliberately.
 *
 * Templates containing template strings are left as-is to prevent scanning issues
 */
export function collapseTemplateWhitespace(source: string): string {
  const marker = 'template: `';
  let out = '';
  let index = 0;
  for (;;) {
    const start = source.indexOf(marker, index);
    if (start === -1) {
      return out + source.slice(index);
    }
    const bodyStart = start + marker.length;
    let end = bodyStart;
    while (end < source.length) {
      if (source[end] === '\\') {
        end += 2;
        continue;
      }
      if (source[end] === '`') {
        break;
      }
      end++;
    }
    const body = source.slice(bodyStart, end);
    out += source.slice(index, bodyStart);
    out += body.includes('${') ? body : body.replace(/\n[ \t]+/g, '\n');
    index = end;
  }
}

/**
 * @param collapseTemplates Strip indentation out of Vue templates
 */
export function VueImportPlugin(collapseTemplates: boolean): BunPlugin {
  return {
    name: 'Vue import plugin',
    setup(build) {
      // We use this to prevent bun from bundling in all of Vue just to get defineComponent
      build.onLoad({ filter: /vue\.runtime/, namespace: 'file' }, () => {
        return {
          contents: 'export const defineComponent = (c) => c;',
          loader: 'ts',
        };
      });

      if (!collapseTemplates) {
        return;
      }

      build.onLoad({ filter: /\.ts$/, namespace: 'file' }, async (args) => {
        return {
          contents: collapseTemplateWhitespace(await Bun.file(args.path).text()),
          loader: 'ts',
        };
      });
    },
  };
}
