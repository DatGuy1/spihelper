import { describe, expect, test } from 'bun:test';
import { addAdminSectionNote } from '../src/utils.ts';

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
