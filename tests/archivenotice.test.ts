import { afterEach, describe, expect, mock, test } from 'bun:test';
import { messages } from '../src/ui/messages.ts';
import { silenceConsoleWarn } from './fixtures/console.ts';
import { spiHelperParseArchiveNoticeText } from '../src/archivenotice.ts';

afterEach(() => {
  mock.restore();
});

describe('spiHelperParseArchiveNoticeText', () => {
  test('reads the username and the flags it recognises', () => {
    const notice = spiHelperParseArchiveNoticeText('{{SPI archive notice|Foo|crosswiki=yes}}');

    expect(notice).toMatchObject({ username: 'Foo', crosswiki: true, deny: false });
  });

  describe('an unrecognised parameter', () => {
    test('names the parameter without quoting a value back', () => {
      // The parser folds y/yes/true/on into true, so echoing the value would tell the clerk
      // the notice says something it does not
      silenceConsoleWarn();

      spiHelperParseArchiveNoticeText('{{SPI archive notice|Foo|nosuchflag=yes}}');

      expect(messages).toHaveLength(1);
      expect(messages[0]?.content).toContain('|nosuchflag');
      expect(messages[0]?.content).not.toContain('=true');
    });

    test('warns once across repeated parses of the same notice', () => {
      silenceConsoleWarn();

      for (let backlink = 0; backlink < 4; backlink++) {
        spiHelperParseArchiveNoticeText('{{SPI archive notice|Foo|nosuchflag=yes}}');
      }

      expect(messages).toHaveLength(1);
    });
  });
});
