import { afterEach, describe, expect, mock, test } from 'bun:test';
import {
  addAdminSectionNote,
  buildPrefilledEditFields,
  buildPrefilledEditFormHtml,
  parseArchiveSections,
  rebuildArchiveText,
  spiHelperGetXWikiPrefix,
  spiHelperStripXWikiPrefix,
} from '../src/utils.ts';
import { type ArchiveSection, SectionEntry } from '../src/types';
import { messages } from '../src/ui/messages.ts';
import { silenceConsoleError } from './fixtures/console.ts';

describe('addAdminSectionNote', () => {
  const note = '* {{clerknote}} a note. ~~~~';
  const marker = '<!-- All comments go ABOVE this line, please. -->';

  test('places the note above the closing rule, below existing comments', () => {
    const result = addAdminSectionNote(note, `===01 January 2019===\n{{SPI case status|}}\n* {{clerknote}} earlier. ~~~~\n----${marker}`);
    expect(result).toBe(
      `===01 January 2019===\n{{SPI case status|}}\n* {{clerknote}} earlier. ~~~~\n${note}\n----${marker}`,
    );
  });

  test('uses the last rule when the section contains more than one', () => {
    const result = addAdminSectionNote(note, `===01 January 2019===\n----\nmid\n----${marker}`);
    expect(result).toBe(`===01 January 2019===\n----\nmid\n${note}\n----${marker}`);
  });

  test('adds a closing rule to a section that has none', () => {
    const result = addAdminSectionNote(note, '===01 January 2019===\n{{SPI case status|}}');
    expect(result).toBe(`===01 January 2019===\n{{SPI case status|}}\n${note}\n----${marker}`);
  });

  test('moves an orphaned comment marker down with the rule it adds', () => {
    const result = addAdminSectionNote(note, `===01 January 2019===\n${marker}\nevidence`);
    expect(result).toBe(`===01 January 2019===\n\nevidence\n${note}\n----${marker}`);
    expect(result.split(marker)).toHaveLength(2);
  });

  test('treats $ patterns in the note as literal text', () => {
    const dollarNote = `* {{clerknote}} from [[WP:SPI/Money$$Man]] costing $& and $\` and $'. ~~~~`;
    const result = addAdminSectionNote(dollarNote, `===01 January 2019===\nevidence\n----${marker}`);
    expect(result).toBe(`===01 January 2019===\nevidence\n${dollarNote}\n----${marker}`);
  });

  test('preserves trailing whitespace when it adds a rule', () => {
    const result = addAdminSectionNote(note, '===01 January 2019===\nevidence\n\n');
    expect(result).toBe(`===01 January 2019===\nevidence\n${note}\n----${marker}\n\n`);
  });
});

describe('rebuildArchiveText', () => {
  const header = '__TOC__\n{{SPI archive notice|1=Foo}}\n{{SPIpriorcases}}\n';

  function makeSection(day: number): ArchiveSection {
    return {
      header: new Date(`0${day} January 2020`),
      fullText: `===0${day} January 2020===\nEvidence ${day}.\n----`,
    };
  }

  test('separates the header from the first section with a single blank line', () => {
    expect(rebuildArchiveText(header, [makeSection(1)])).toBe(
      `__TOC__\n{{SPI archive notice|1=Foo}}\n{{SPIpriorcases}}\n\n${makeSection(1).fullText}`,
    );
  });

  test('does not accumulate blank lines when archiving repeatedly', () => {
    let archive = header;
    let entries: SectionEntry[] = [];
    for (let day = 1; day <= 3; day++) {
      const parsed = parseArchiveSections(archive, entries) ?? [];
      parsed.push(makeSection(day));
      archive = rebuildArchiveText(archive, parsed);
      entries = Array.from({ length: day }, (_, i) => new SectionEntry(i, `0${i + 1} January 2020`));
    }
    expect(archive).toBe([
      '__TOC__\n{{SPI archive notice|1=Foo}}\n{{SPIpriorcases}}',
      makeSection(1).fullText,
      makeSection(2).fullText,
      makeSection(3).fullText,
    ].join('\n\n'));
  });

  test('does not lead with a blank line when the archive has no header', () => {
    expect(rebuildArchiveText('', [makeSection(1)])).toBe(makeSection(1).fullText);
  });
});

describe('parseArchiveSections', () => {
  const badArchive = '===Not a date===\nEvidence.\n----';
  const badEntries = [new SectionEntry(0, 'Not a date')];

  afterEach(() => {
    mock.restore();
  });

  test('gives up on a section header whose date it cannot read', () => {
    const error = silenceConsoleError();

    expect(parseArchiveSections(badArchive, badEntries)).toBeNull();
    expect(error).toHaveBeenCalledWith(expect.stringContaining('Not a date'));
  });

  // Every caller shows its own message on the null return, so a message from here too
  // would stack a second one on the panel for the same failure
  test('names the bad section on the console rather than in the message panel', () => {
    silenceConsoleError();

    parseArchiveSections(badArchive, badEntries);

    expect(messages).toHaveLength(0);
  });
});

describe('spiHelperGetXWikiPrefix', () => {
  test('returns the prefix of a cross-wiki title', () => {
    expect(spiHelperGetXWikiPrefix('meta:Steward requests/Global')).toBe('meta');
    expect(spiHelperGetXWikiPrefix('m:Steward requests/Global')).toBe('m');
  });

  test('returns null for a local title, namespaced or not', () => {
    expect(spiHelperGetXWikiPrefix('Wikipedia:Sockpuppet investigations/Foo')).toBeNull();
    expect(spiHelperGetXWikiPrefix('Foo')).toBeNull();
  });

  test('does not treat a prefix-lookalike as cross-wiki', () => {
    expect(spiHelperGetXWikiPrefix('metadata:Foo')).toBeNull();
  });

  test('stripping leaves the on-wiki title', () => {
    expect(spiHelperStripXWikiPrefix('meta:Steward requests/Global')).toBe('Steward requests/Global');
    expect(spiHelperStripXWikiPrefix('User:Foo')).toBe('User:Foo');
  });
});

describe('buildPrefilledEditFields', () => {
  const fields = buildPrefilledEditFields({
    text: 'Foo',
    summary: 'Bar',
    base: { text: 'Foo', revid: 5678 },
    startTimestamp: '2026-01-02T03:10:00.123Z',
  });

  test('names the revision we read by id, so Publish catches edit conflicts', () => {
    expect(fields.editRevId).toBe('5678');
  });

  test('carries when editing started, in the form format', () => {
    expect(fields.wpStarttime).toBe('20260102031000');
  });

  test('keeps the watch box checked, absent would unwatch', () => {
    expect(fields.wpWatchthis).toBe('1');
  });

  test('asks for a diff rather than a save', () => {
    expect(fields.wpDiff).toBe('1');
    expect(fields).not.toHaveProperty('wpSave');
    expect(fields).not.toHaveProperty('wpEditToken');
  });

  test('marks the form as complete', () => {
    expect(fields.wpUltimateParam).toBe('1');
  });

  test('passes the text and summary through untouched', () => {
    expect(fields.wpTextbox1).toBe('Foo');
    expect(fields.wpSummary).toBe('Bar');
  });
});

describe('buildPrefilledEditFormHtml', () => {
  function parseForm(html: string): HTMLFormElement {
    const container = document.createElement('div');
    container.innerHTML = html;
    const form = container.querySelector('form');
    if (!form) {
      throw new Error('no form rendered');
    }
    return form;
  }

  const edit = {
    text: 'Line one\n"quoted" & <b>bold</b>',
    summary: 'Bar',
    base: { text: '', revid: 5678 },
    startTimestamp: '2026-01-02T03:10:00Z',
  };
  const fields = buildPrefilledEditFields(edit);
  const form = parseForm(buildPrefilledEditFormHtml({
    ...edit, title: 'meta:Steward requests/Global', label: 'Open',
  }));

  test('posts to a new tab, so the user stays on the case', () => {
    expect(form.getAttribute('method')).toBe('post');
    expect(form.getAttribute('target')).toBe('_blank');
  });

  test('sends a cross-wiki title to the edit form on meta, without its prefix', () => {
    const action = new URL(form.getAttribute('action') ?? '');
    expect(action.origin).toBe('https://meta.wikimedia.org');
    expect(action.pathname).toBe('/w/index.php');
    expect(action.searchParams.get('title')).toBe('Steward_requests/Global');
    expect(action.searchParams.get('action')).toBe('submit');
  });

  test('carries every field through intact, markup and newlines included', () => {
    const posted = Object.fromEntries(
      [...form.querySelectorAll('input')].map(input => [input.name, input.value]),
    );
    expect(posted).toEqual(fields);
  });

  test('is submitted by a button the user clicks', () => {
    expect(form.querySelector('button')?.getAttribute('type')).toBe('submit');
  });
});
