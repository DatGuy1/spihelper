import { beforeEach, describe, expect, test } from 'bun:test';
import {
  addAdminSectionNote,
  parseArchiveSections,
  parseUserTags,
  rebuildArchiveText,
  spiHelperGetXWikiPrefix,
  spiHelperStripXWikiPrefix,
} from '../src/utils.ts';
import { SectionEntry } from '../src/state.ts';
import { messages } from '../src/ui/messages.ts';
import type { ArchiveSection } from '../src/types';

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

describe('parseUserTags', () => {
  beforeEach(() => {
    messages.length = 0;
  });

  test('warns that a status it cannot read will be overwritten', () => {
    const tags = parseUserTags('{{sockpuppet|Master|suspected}}', 'SockA');

    expect(tags).toEqual([]);
    expect(messages).toHaveLength(1);
    expect(messages[0]?.content).toContain('SockA');
    expect(messages[0]?.content).toContain('suspected');
  });
});
