import { afterEach, describe, expect, mock, test } from 'bun:test';
import { SockmasterTag, parseUserTags } from '../src/tags.ts';
import { messages } from '../src/ui/messages.ts';
import { makeSockTag } from './fixtures/spi.ts';
import { silenceConsoleWarn } from './fixtures/console.ts';

describe('SockpuppetTag', () => {
  describe('altmasterStatus', () => {
    test('defaults to suspected when not supplied', () => {
      expect(makeSockTag().altmasterStatus).toBe('suspected');
    });

    test('keeps an explicitly supplied status', () => {
      expect(makeSockTag({ altmasterStatus: 'proven' }).altmasterStatus).toBe('proven');
    });

    test('survives a clone', () => {
      const tag = makeSockTag({ altmaster: 'Alt', altmasterStatus: 'proven' });
      expect(tag.clone().altmasterStatus).toBe('proven');
    });

    test('is written out whenever an altmaster is set', () => {
      const tag = makeSockTag({ altmaster: 'Alt' });
      expect(tag.generateWikitext()).toContain('| altmaster-status = suspected');
    });

    test('is omitted entirely when there is no altmaster', () => {
      expect(makeSockTag().generateWikitext()).not.toContain('altmaster');
    });
  });
  describe('master normalisation', () => {
    // Downstream code (sock categories, the lock request heading, the master-vs-sock talk
    // notice) compares and interpolates these raw, so they have to be canonical here.
    test('normalises the master', () => {
      expect(makeSockTag({ master: ' User:Foo ' }).master).toBe('Foo');
    });

    test('normalises the altmaster', () => {
      expect(makeSockTag({ altmaster: ' User:Alt ' }).altmaster).toBe('Alt');
    });

    test('leaves an absent master empty rather than inventing one', () => {
      expect(makeSockTag({ master: '' }).master).toBe('');
      expect(makeSockTag().altmaster).toBe('');
    });

    test('survives a clone', () => {
      expect(makeSockTag({ master: ' User:Foo ' }).clone().master).toBe('Foo');
    });
  });
  describe('equals', () => {
    test('compares altmasterStatus when an altmaster is set', () => {
      const suspected = makeSockTag({ altmaster: 'Alt', altmasterStatus: 'suspected' });
      const proven = makeSockTag({ altmaster: 'Alt', altmasterStatus: 'proven' });
      expect(suspected.equals(proven)).toBe(false);
    });

    test('ignores altmasterStatus when there is no altmaster', () => {
      const stale = makeSockTag({ altmasterStatus: 'proven' });
      const fresh = makeSockTag({ altmasterStatus: 'suspected' });
      expect(stale.equals(fresh)).toBe(true);
      expect(stale.generateWikitext()).toBe(fresh.generateWikitext());
    });

    test('still distinguishes tags whose altmaster differs', () => {
      expect(makeSockTag({ altmaster: 'Alt' }).equals(makeSockTag())).toBe(false);
    });

    test('is false for a sockmaster tag', () => {
      expect(makeSockTag().equals(new SockmasterTag({ status: 'blocked' }))).toBe(false);
    });
  });
});

describe('SockmasterTag', () => {
  describe('generateWikitext', () => {
    test('marks confirmed and banned as checked', () => {
      expect(new SockmasterTag({ status: 'confirmed' }).generateWikitext())
        .toContain('| checked = yes');
      expect(new SockmasterTag({ status: 'banned' }).generateWikitext())
        .toContain('| checked = yes');
    });

    test('does not mark a blocked master as checked', () => {
      expect(new SockmasterTag({ status: 'blocked' }).generateWikitext())
        .not.toContain('checked');
    });

    test('drops a checked flag inherited from a demoted confirmed tag', () => {
      const demoted = new SockmasterTag({ status: 'blocked', checked: true });
      expect(demoted.generateWikitext()).not.toContain('checked');
    });

    test('writes banned rather than blocked for a 3X banned master', () => {
      expect(new SockmasterTag({ status: 'banned' }).generateWikitext()).toContain('| 1 = banned');
    });
  });
});

describe('parseUserTags', () => {
  afterEach(() => {
    mock.restore();
  });

  test('warns that a status it cannot read will be overwritten', () => {
    // This path warns by design; silence it so a passing run doesn't look broken
    const warn = silenceConsoleWarn();

    const tags = parseUserTags('{{sockpuppet|Master|suspected}}', 'SockA');

    expect(tags).toEqual([]);
    expect(warn).toHaveBeenCalled();
    expect(messages).toHaveLength(1);
    expect(messages[0]?.content).toContain('SockA');
    expect(messages[0]?.content).toContain('suspected');
  });

  // Every section switch rebuilds the rows and re-parses the same cached user page, so a
  // warning that stacked per parse would grow the panel for as long as the clerk works
  test('warns once however many times the same page is re-parsed', () => {
    silenceConsoleWarn();

    for (let pass = 0; pass < 5; pass++) {
      parseUserTags('{{sockpuppet|Master|suspected}}', 'SockA');
    }

    expect(messages).toHaveLength(1);
  });

  test('still warns separately for each user it cannot read', () => {
    silenceConsoleWarn();

    parseUserTags('{{sockpuppet|Master|suspected}}', 'SockA');
    parseUserTags('{{sockpuppet|Master|suspected}}', 'SockB');

    expect(messages).toHaveLength(2);
  });
});
