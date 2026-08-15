import { describe, expect, test } from 'bun:test';
import { collapseTemplateWhitespace } from '../plugin.ts';

describe('collapseTemplateWhitespace', () => {
  test('strips the indentation a template picked up from its source position', () => {
    const source = [
      '  template: `',
      '    <div>',
      '      <span>Hi</span>',
      '    </div>',
      '  `,',
    ].join('\n');

    expect(collapseTemplateWhitespace(source)).toBe([
      '  template: `',
      '<div>',
      '<span>Hi</span>',
      '</div>',
      '`,',
    ].join('\n'));
  });

  test('leaves everything outside a template alone', () => {
    const source = 'const x = {\n    a: 1,\n};\n';

    expect(collapseTemplateWhitespace(source)).toBe(source);
  });

  test('collapses each of several templates', () => {
    const source = 'template: `\n    <a />\n`,\ntemplate: `\n    <b />\n`,';

    expect(collapseTemplateWhitespace(source)).toBe('template: `\n<a />\n`,\ntemplate: `\n<b />\n`,');
  });

  describe('a template using interpolation', () => {
    // A ${...} can hold a nested template literal, so the backtick the scan stops at is not
    // necessarily the end of the template, and the collapse would land on a mis-measured range
    test('is left exactly as written', () => {
      const source = 'template: `\n    <div>${items.map(i => `\n        <b>${i}</b>\n    `)}</div>\n`,';

      expect(collapseTemplateWhitespace(source)).toBe(source);
    });

    test('does not stop a plain template later in the file being collapsed', () => {
      const source = 'template: `\n    <a>${x}</a>\n`,\ntemplate: `\n    <b />\n`,';

      expect(collapseTemplateWhitespace(source))
        .toBe('template: `\n    <a>${x}</a>\n`,\ntemplate: `\n<b />\n`,');
    });
  });
});
