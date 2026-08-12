import { describe, expect, test } from 'bun:test';
import { fetchTemplateArguments, findTemplateSpans, parseTemplate, parseTemplates } from '../src/template.ts';

describe('parseTemplate', () => {
  test('parses template name (lowercased)', () => {
    const t = parseTemplate('Sock List|1=SockA');
    expect(t.name).toBe('sock list');
  });

  test('parses named string param', () => {
    const t = parseTemplate('foo|bar=baz');
    expect(t.params.bar).toBe('baz');
  });

  test('parses numeric-keyed params', () => {
    const t = parseTemplate('sock list|1=SockA|2=SockB');
    expect(t.params[1]).toBe('SockA');
    expect(t.params[2]).toBe('SockB');
  });

  test('parses positional params', () => {
    const t = parseTemplate('sock list|SockA|SockB');
    expect(t.positional).toEqual(['SockA', 'SockB']);
  });

  test('ignores pipes inside wikilinks', () => {
    const t = parseTemplate('sock list|1=SockA|note1=added by [[User:Foo|Foo]] ([[User talk:Foo|talk]])');
    expect(t.params[1]).toBe('SockA');
    expect(t.params.note1).toBe('added by [[User:Foo|Foo]] ([[User talk:Foo|talk]])');
  });

  test('ignores pipes inside nested templates', () => {
    const t = parseTemplate('foo|bar={{inner|arg}}|baz=qux');
    expect(t.params.bar).toBe('{{inner|arg}}');
    expect(t.params.baz).toBe('qux');
  });

  test('converts yes/no param values to booleans', () => {
    const t = parseTemplate('foo|tools_link=yes|hidden=no');
    expect(t.params.tools_link).toBe(true);
    expect(t.params.hidden).toBe(false);
  });

  test('converts numeric param values to numbers', () => {
    const t = parseTemplate('foo|count=3');
    expect(t.params.count).toBe(3);
  });
});

describe('fetchTemplateArguments', () => {
  test('returns numeric-keyed params as strings', () => {
    const t = parseTemplate('sock list|1=SockA|2=SockB|tools_link=yes');
    expect(fetchTemplateArguments(t)).toEqual(['SockA', 'SockB']);
  });

  test('returns positional params', () => {
    const t = parseTemplate('sock list|SockA|SockB');
    expect(fetchTemplateArguments(t)).toEqual(['SockA', 'SockB']);
  });

  test('does not return wikilink display text as a username', () => {
    // Pipes inside [[User:Foo|Foo]] were being split, producing
    // "Foo]] ([[User talk:Foo" etc. as extra positional entries.
    const wikiText = `
    {{sock list
    |1=~2026-00000-01
    |2=~2026-00000-02
    |note2=added by [[User:Foo|Foo]] ([[User talk:Foo|talk]]) 12:00, 1 January 2026 (UTC)
    |tools_link=yes
    }}
   `;
    const templates = parseTemplates(wikiText);
    expect(templates).toHaveLength(1);
    const [t] = templates;
    if (!t) throw new Error('expected template');
    expect(fetchTemplateArguments(t)).toEqual(['~2026-00000-01', '~2026-00000-02']);
  });
});

describe('parseTemplates', () => {
  test('extracts multiple templates from wikitext', () => {
    const templates = parseTemplates('{{foo|a=1}} some text {{bar|b=2}}');
    expect(templates).toHaveLength(2);
    expect(templates[0]?.name).toBe('foo');
    expect(templates[1]?.name).toBe('bar');
  });

  test('returns empty array for wikitext with no templates', () => {
    expect(parseTemplates('just plain text')).toEqual([]);
  });
});

describe('findTemplateSpans', () => {
  test('spans the whole template', () => {
    const text = 'before {{sock list|1=A|2=B}} after';
    const [span] = findTemplateSpans('sock list', text);

    expect(span?.text).toBe('{{sock list|1=A|2=B}}');
    expect(text.slice(span?.start, span?.end)).toBe('{{sock list|1=A|2=B}}');
  });

  test('does not stop at a nested template inside a parameter', () => {
    const list = '{{sock list|1=A|note1=({{clerknote}} original case name)|tools_link=yes}}';
    const [span] = findTemplateSpans('sock list', `${list}\n`);

    expect(span?.text).toBe(list);
  });

  test('handles several levels of nesting', () => {
    const list = '{{sock list|1=A|note1={{a|{{b|{{c}}}}}}}}';

    expect(findTemplateSpans('sock list', list)[0]?.text).toBe(list);
  });

  test('finds every occurrence', () => {
    const spans = findTemplateSpans('sock list', '{{sock list|1=A}} text {{sock list|1=B}}');

    expect(spans.map(span => span.text))
      .toEqual(['{{sock list|1=A}}', '{{sock list|1=B}}']);
  });

  test('does not report a nested match as its own span', () => {
    const list = '{{sock list|1=A|note1={{sock list|1=B}}}}';
    const spans = findTemplateSpans('sock list', list);

    expect(spans.map(span => span.text)).toEqual([list]);
  });

  test('skips an unclosed template rather than running to the end of the text', () => {
    expect(findTemplateSpans('sock list', '{{sock list|1=A')).toEqual([]);
  });

  test('returns empty when nothing matches', () => {
    expect(findTemplateSpans('sock list', '{{other template|1=A}}')).toEqual([]);
  });

  describe('name matching follows MediaWiki', () => {
    test('is case-insensitive', () => {
      expect(findTemplateSpans('sock list', '{{Sock List|1=A}}')).toHaveLength(1);
    });

    test('treats underscores and spaces as the same character', () => {
      expect(findTemplateSpans('sock list', '{{sock_list|1=A}}')).toHaveLength(1);
      expect(findTemplateSpans('sock_list', '{{sock list|1=A}}')).toHaveLength(1);
    });

    test('tolerates padding around the name', () => {
      expect(findTemplateSpans('sock list', '{{ sock  list |1=A}}')).toHaveLength(1);
    });

    test('does not match a template whose name merely starts with it', () => {
      expect(findTemplateSpans('sock list', '{{sock listing|1=A}}')).toEqual([]);
    });

    test('matches a template with no parameters', () => {
      expect(findTemplateSpans('sock list', '{{sock list}}')[0]?.text).toBe('{{sock list}}');
    });

    test('takes a name containing regex metacharacters literally', () => {
      expect(findTemplateSpans('pp-sock', '{{pp-sock|small=yes}}')).toHaveLength(1);
      expect(findTemplateSpans('a.c', '{{abc|1=A}}')).toEqual([]);
    });
  });
});
