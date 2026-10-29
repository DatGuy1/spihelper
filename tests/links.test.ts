import { describe, expect, test } from 'bun:test';
import type { LinkTool } from '../src/types';
import {
  buildLinkToolUrl,
  differsFromBuiltin,
  getLinkTools,
  linkToolProblem,
  markEditedLinkTools,
  reconcileLinkTools,
  restoreBuiltinLinkTools,
} from '../src/links.ts';
import { spiHelperBuiltinLinkTools } from '../src/constants';

const makeTool = (overrides: Partial<LinkTool> = {}): LinkTool => ({
  id: 'custom-1',
  enabled: true,
  label: 'Tool',
  url: 'https://tool.toolforge.org/',
  userParam: 'users',
  separator: '|',
  wrapper: '',
  repeatParam: false,
  ...overrides,
});

function builtin(id: string): LinkTool {
  const tool = spiHelperBuiltinLinkTools.find(t => t.id === id);
  if (!tool) {
    throw new Error(`No built-in link tool ${id}`);
  }
  return { ...tool };
}

const builtinIds = spiHelperBuiltinLinkTools.map(t => t.id);
const ids = (tools: LinkTool[]) => tools.map(t => t.id);

describe('linkToolProblem', () => {
  test('accepts a complete tool', () => {
    expect(linkToolProblem(makeTool())).toBeNull();
  });

  test('accepts a URL with a case placeholder', () => {
    expect(linkToolProblem(makeTool({ url: 'https://tool.toolforge.org/{case}' }))).toBeNull();
  });

  test.each([
    ['a blank label', { label: ' ' }],
    ['a missing URL', { url: '' }],
    ['a relative URL', { url: '/wiki/Special:Contributions' }],
    ['an http URL', { url: 'http://tool.toolforge.org/' }],
    ['a javascript URL', { url: 'javascript:alert(1)' }],
    ['a blank parameter', { userParam: '' }],
  ])('flags %s', (_, overrides: Partial<LinkTool>) => {
    expect(linkToolProblem(makeTool(overrides))).not.toBeNull();
  });

  test('passes every built-in tool', () => {
    for (const tool of spiHelperBuiltinLinkTools) {
      expect(linkToolProblem(tool)).toBeNull();
    }
  });
});

describe('getLinkTools', () => {
  test('keeps enabled, usable tools in the order given', () => {
    const tools = [
      makeTool({ id: 'custom-b' }),
      makeTool({ id: 'custom-off', enabled: false }),
      makeTool({ id: 'custom-bad', url: 'http://insecure.example/' }),
      makeTool({ id: 'custom-a' }),
    ];
    expect(ids(getLinkTools(tools))).toEqual(['custom-b', 'custom-a']);
  });

  test('ships SPI Tools and Interaction Timeline switched off', () => {
    expect(ids(getLinkTools(spiHelperBuiltinLinkTools)))
      .toEqual(['analyser', 'timeline', 'timecard', 'pages', 'summary', 'cuwiki', 'interleaved']);
  });
});

describe('reconcileLinkTools', () => {
  test('gives the built-ins when nothing usable was saved', () => {
    expect(reconcileLinkTools(undefined)).toEqual(spiHelperBuiltinLinkTools);
    expect(reconcileLinkTools({ builtins: {} })).toEqual(spiHelperBuiltinLinkTools);
  });

  test('does not hand out the built-in objects themselves', () => {
    expect(reconcileLinkTools([])[0]).not.toBe(spiHelperBuiltinLinkTools[0]);
  });

  describe('unedited built-ins', () => {
    test('take the current definition', () => {
      const stale = { ...builtin('timeline'), url: 'https://sandals.toolforge.org/timeline' };
      const [timeline] = reconcileLinkTools([stale]);
      expect(timeline).toEqual(builtin('timeline'));
    });

    test('keep the user\'s on/off choice', () => {
      const [timecard, spiTools] = reconcileLinkTools([
        { ...builtin('timecard'), enabled: false },
        { ...builtin('spitools-timecard'), enabled: true },
      ]);
      expect(timecard?.enabled).toBe(false);
      expect(spiTools?.enabled).toBe(true);
    });

    test('are dropped once they no longer ship', () => {
      expect(ids(reconcileLinkTools([makeTool({ id: 'retired' })]))).not.toContain('retired');
    });
  });

  describe('edited built-ins', () => {
    test('are kept as the user left them', () => {
      const edited = { ...builtin('timeline'), label: 'My timeline', edited: true };
      expect(reconcileLinkTools([edited])[0]).toEqual(edited);
    });

    test('are kept even once they no longer ship', () => {
      const edited = makeTool({ id: 'retired', edited: true });
      expect(reconcileLinkTools([edited])).toContainEqual(edited);
    });
  });

  test('keeps the user\'s own tools and the order of the list', () => {
    const custom = makeTool();
    const result = reconcileLinkTools([builtin('interleaved'), custom, builtin('analyser')]);
    expect(ids(result).slice(0, 3)).toEqual(['interleaved', 'custom-1', 'analyser']);
    expect(result[1]).toBe(custom);
  });

  test('adds new built-ins at the end in their default state', () => {
    const result = reconcileLinkTools([makeTool(), builtin('analyser')]);
    expect(ids(result)).toEqual(['custom-1', ...builtinIds]);
    expect(result.find(t => t.id === 'spitools-pages')?.enabled).toBe(false);
  });

  test('drops entries without an id, and repeats of one', () => {
    const result = reconcileLinkTools([null, { label: 'x' }, makeTool(), makeTool({ label: 'Again' })]);
    expect(result.filter(t => t.id === 'custom-1')).toEqual([makeTool()]);
  });
});

describe('markEditedLinkTools', () => {
  test('leaves an untouched list as it is', () => {
    const tools = reconcileLinkTools([]);
    expect(markEditedLinkTools(tools)).toEqual(tools);
    expect(markEditedLinkTools(tools)[0]).toBe(tools[0]);
  });

  test('flags a built-in whose fields changed, but not one only switched off or moved', () => {
    const [renamed, off] = markEditedLinkTools([
      { ...builtin('timeline'), label: 'Renamed' },
      { ...builtin('timecard'), enabled: false },
    ]);
    expect(renamed?.edited).toBe(true);
    expect(off?.edited).toBeUndefined();
  });

  test('clears the flag once a built-in is set back to match', () => {
    const [reverted] = markEditedLinkTools([{ ...builtin('timeline'), edited: true }]);
    expect(reverted).toEqual(builtin('timeline'));
  });

  test('never flags the user\'s own tools', () => {
    expect(markEditedLinkTools([makeTool()])[0]?.edited).toBeUndefined();
  });

  test('round-trips: an edit survives the next load', () => {
    const [edited] = markEditedLinkTools([{ ...builtin('timeline'), url: 'https://mine.example/' }]);
    expect(reconcileLinkTools([edited])[0]?.url).toBe('https://mine.example/');
  });
});

describe('restoreBuiltinLinkTools', () => {
  test('resets edited built-ins, keeping on/off, order and the user\'s own tools', () => {
    const custom = makeTool();
    const result = restoreBuiltinLinkTools([
      custom,
      { ...builtin('timeline'), label: 'Mine', enabled: false, edited: true },
    ]);
    expect(result[0]).toBe(custom);
    expect(result[1]).toEqual({ ...builtin('timeline'), enabled: false });
    expect(result.some(differsFromBuiltin)).toBe(false);
  });
});

describe('buildLinkToolUrl', () => {
  test('returns null for a tool that needs a case where there is none', () => {
    expect(buildLinkToolUrl(makeTool({ url: 'https://tool.toolforge.org/{case}' }), '', ['User1'])).toBeNull();
  });

  test('encodes the case name so it cannot reshape the URL', () => {
    const url = buildLinkToolUrl(makeTool({ url: 'https://tool.toolforge.org/spi/{case}' }), 'A/B?c#d', ['User1']);
    expect(url?.pathname).toBe('/spi/A%2FB%3Fc%23d');
    expect(url?.searchParams.get('users')).toBe('User1');
  });

  test('returns null rather than a non-https link', () => {
    expect(buildLinkToolUrl(makeTool({ url: 'javascript:alert(1)' }), 'Master', ['User1'])).toBeNull();
  });

  test('repeats the parameter when asked, ignoring the separator', () => {
    const url = buildLinkToolUrl(makeTool({ repeatParam: true }), 'Master', ['User1', 'User2']);
    expect(url?.searchParams.getAll('users')).toEqual(['User1', 'User2']);
  });

  test('wraps then joins', () => {
    const url = buildLinkToolUrl(makeTool({ wrapper: '"', separator: ' OR ' }), 'Master', ['User1', 'User2']);
    expect(url?.searchParams.get('users')).toBe('"User1" OR "User2"');
  });
});
