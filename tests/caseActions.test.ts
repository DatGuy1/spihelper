import { afterEach, describe, expect, mock, spyOn, test } from 'bun:test';
import * as blockModule from '../src/actions/block.ts';
import * as lockModule from '../src/actions/lock.ts';
import * as logModule from '../src/actions/log.ts';
import * as tagModule from '../src/actions/tag.ts';
import * as apiModule from '../src/api.ts';
import * as roleModule from '../src/role.ts';
import type { BlockEntry } from '../src/types';
import { spiHelperHandleBlocks, spiHelperPerformActions } from '../src/caseActions.ts';
import { spiHelperSettings } from '../src/options';
import { CaseState, SectionEntry } from '../src/state.ts';
import { getInitialCaseActions } from '../src/ui/views/top/utils';
import { setupBlockActionData } from '../src/utils.ts';
import {
  type BlockRowData,
  ParsedArchiveNotice,
  SockmasterTag,
  SockpuppetTag,
  type UserRow,
} from '../src/types';

const contextModule = await import('../src/context.ts');
contextModule.setContext('Wikipedia:Sockpuppet investigations/Foo');
const { context } = contextModule;

function makeRow(username: string, block: Partial<BlockRowData> = {}): UserRow {
  return {
    id: username,
    username,
    link: {
      analyser: false, timeline: false, timecard: false, pages: false,
      summary: false, cuwiki: false, interleaved: false,
    },
    block: {
      block: true, duration: '1 week', acb: false, abao: false, ntp: false, nem: false,
      lock: false, tags: [], ...block,
    },
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

/**
 * Stubs the role checks and API calls the block/tag/lock pipeline reaches for
 * but only work as a userscript, and hands back the spies tests assert against
 */
function stubUserActions(opts: { isAdmin?: boolean; userBlocks?: Map<string, BlockEntry> } = {}) {
  const userBlocks = opts.userBlocks ?? new Map<string, BlockEntry>();
  spyOn(roleModule, 'spiHelperIsAdmin').mockReturnValue(opts.isAdmin ?? true);
  spyOn(roleModule, 'spiHelperIsCheckuser').mockReturnValue(true);
  spyOn(tagModule, 'createSockCategories').mockResolvedValue(new Map());
  spyOn(apiModule, 'spiHelperGetBulkUserBlockSettings').mockResolvedValue(userBlocks);
  const pageTextSpy = spyOn(apiModule, 'spiHelperGetBulkPageText').mockResolvedValue(new Map());
  const talkNoticeSpy = spyOn(blockModule, 'spiHelperAddTalkBlockNotice')
    .mockResolvedValue(undefined);
  const tagSpy = spyOn(tagModule, 'spiHelperTagUser').mockResolvedValue(true);
  // Block requests are jittered with a real setTimeout to avoid hitting API rate limits
  // (see caseActions.ts); run the callback immediately so the test doesn't sleep for it.
  spyOn(globalThis, 'setTimeout').mockImplementation(((fn: () => void) => {
    fn();
    return 0;
  }) as unknown as typeof setTimeout);
  return { pageTextSpy, talkNoticeSpy, tagSpy };
}

describe('spiHelperHandleBlocks', () => {
  afterEach(() => {
    mock.restore();
  });

  test('talkNoticePromises and tagPromises are already populated by the time the function returns, before the block API call settles', async () => {
    // Regression test: talkNoticePromises/tagPromises used to only get their entries pushed
    // *after* spiHelperProcessBlockRow resolved, which happens well after this function has
    // already returned. Callers do Promise.all(talkNoticePromises) right away, so those
    // promises were racing against an array that was still empty at that point.
    stubUserActions();

    const blockGate = deferred<boolean>();
    spyOn(blockModule, 'spiHelperProcessBlockRow').mockReturnValue(blockGate.promise);

    const row = makeRow('Vandal', {
      tags: [new SockpuppetTag({ master: 'Master', status: 'blocked' })],
    });

    const { talkNoticePromises, tagPromises, blockPromises } = await spiHelperHandleBlocks({
      accounts: [row],
      blockData: { ...setupBlockActionData(), master: 'Master' },
    });

    // The block API call is still pending (blockGate hasn't resolved), but the arrays
    // the caller is about to Promise.all() must already have their entries.
    expect(talkNoticePromises).toHaveLength(1);
    expect(tagPromises).toHaveLength(1);

    blockGate.resolve(true);
    const [blockedUsers, taggedUsers] = await Promise.all([
      Promise.all(blockPromises),
      Promise.all(tagPromises),
    ]);
    await Promise.all(talkNoticePromises);

    expect(blockedUsers).toEqual(['Vandal']);
    expect(taggedUsers).toEqual(['Vandal']);
  });

  test('does not tag or send a talk notice when the block fails', async () => {
    const { talkNoticeSpy, tagSpy } = stubUserActions();
    spyOn(blockModule, 'spiHelperProcessBlockRow').mockResolvedValue(false);

    const row = makeRow('Vandal', {
      tags: [new SockpuppetTag({ master: 'Master', status: 'blocked' })],
    });

    const { blockPromises, tagPromises, talkNoticePromises } = await spiHelperHandleBlocks({
      accounts: [row],
      blockData: { ...setupBlockActionData(), master: 'Master' },
    });

    const [blockedUsers, taggedUsers] = await Promise.all([
      Promise.all(blockPromises),
      Promise.all(tagPromises),
    ]);
    await Promise.all(talkNoticePromises);

    expect(blockedUsers).toEqual([null]);
    expect(taggedUsers).toEqual([null]);
    expect(tagSpy).not.toHaveBeenCalled();
    expect(talkNoticeSpy).not.toHaveBeenCalled();
  });

  test('already-blocked users are tagged without a second, redundant tag call', async () => {
    const { tagSpy } = stubUserActions({
      userBlocks: new Map([
        ['Vandal', {
          username: 'Vandal', duration: 'indefinite', acb: false, abao: false,
          ntp: false, nem: false, reason: '',
        }],
      ]),
    });
    const processSpy = spyOn(blockModule, 'spiHelperProcessBlockRow');

    const row = makeRow('Vandal', {
      tags: [new SockpuppetTag({ master: 'Master', status: 'blocked' })],
    });

    const { blockPromises, tagPromises } = await spiHelperHandleBlocks({
      accounts: [row],
      blockData: { ...setupBlockActionData(), master: 'Master' },
    });

    expect(tagPromises).toHaveLength(1);
    const [blockedUsers, taggedUsers] = await Promise.all([
      Promise.all(blockPromises),
      Promise.all(tagPromises),
    ]);

    expect(blockedUsers).toEqual([null]);
    expect(taggedUsers).toEqual(['Vandal']);
    expect(tagSpy).toHaveBeenCalledTimes(1);
    // Already blocked and override is off, so the real block API is never attempted.
    expect(processSpy).not.toHaveBeenCalled();
  });

  describe('username canonicalisation', () => {
    // Usernames are typed straight into the table, and the API answers keyed by canonical
    // names - a stale key would make an existing page look empty and get overwritten
    async function handleRows(rows: UserRow[]) {
      const { pageTextSpy, tagSpy } = stubUserActions({ isAdmin: false });

      const { tagPromises } = await spiHelperHandleBlocks({
        accounts: rows,
        blockData: { ...setupBlockActionData(), master: 'Master' },
      });
      await Promise.all(tagPromises);
      return { tagSpy, pageTextSpy };
    }

    test('normalises a typed username before it is used as an API target', async () => {
      const row = makeRow(' User:Vandal ', {
        block: false,
        tags: [new SockpuppetTag({ master: 'Master', status: 'blocked' })],
      });

      const { tagSpy, pageTextSpy } = await handleRows([row]);

      expect(row.username).toBe('Vandal');
      expect(pageTextSpy).toHaveBeenCalledWith(['User:Vandal']);
      expect(tagSpy.mock.calls[0]?.[0].sock.username).toBe('Vandal');
    });

    test('drops a row whose username is only whitespace', async () => {
      const row = makeRow('   ', { block: false });

      const { pageTextSpy } = await handleRows([row]);

      expect(pageTextSpy).toHaveBeenCalledWith([]);
    });
  });

  describe('lock request master', () => {
    /** Locks the given rows and returns the master that the lock request was filed under */
    async function getRequestedLockMaster(rows: UserRow[], caseMaster: string) {
      stubUserActions({ isAdmin: false });
      const lockSpy = spyOn(lockModule, 'spiHelperRequestLocks').mockResolvedValue([]);

      const { lockPromise } = await spiHelperHandleBlocks({
        accounts: rows,
        blockData: { ...setupBlockActionData(), master: caseMaster },
      });
      await lockPromise;

      expect(lockSpy).toHaveBeenCalledTimes(1);
      return lockSpy.mock.calls[0]?.[0].master;
    }

    test('files under the master the sock tags agree on, not the case name', async () => {
      // The case is named after a sock, but the tags point at the real master
      // rather than the case name
      const rows = [
        makeRow('SockA', {
          lock: true,
          tags: [new SockpuppetTag({ master: 'RealMaster', status: 'blocked' })],
        }),
        makeRow('SockB', {
          lock: true,
          tags: [new SockpuppetTag({ master: 'RealMaster', status: 'blocked' })],
        }),
      ];

      expect(await getRequestedLockMaster(rows, 'CaseNamedAfterASock')).toBe('RealMaster');
    });

    test('falls back to the case master when the lock targets name different masters', async () => {
      const rows = [
        makeRow('SockA', {
          lock: true,
          tags: [new SockpuppetTag({ master: 'MasterOne', status: 'blocked' })],
        }),
        makeRow('SockB', {
          lock: true,
          tags: [new SockpuppetTag({ master: 'MasterTwo', status: 'blocked' })],
        }),
      ];

      expect(await getRequestedLockMaster(rows, 'Foo')).toBe('Foo');
    });

    test('falls back to the case master when no lock target has a sock tag', async () => {
      // Lock is independent of tagging: an untagged row, and the master's own row, carry
      // no sockpuppet master to borrow.
      const rows = [
        makeRow('SockA', { lock: true }),
        makeRow('Foo', { lock: true, tags: [new SockmasterTag({ status: 'blocked' })] }),
      ];

      expect(await getRequestedLockMaster(rows, 'Foo')).toBe('Foo');
    });

    test('ignores the tags of rows that are not lock targets', async () => {
      const rows = [
        makeRow('SockA', {
          lock: true,
          tags: [new SockpuppetTag({ master: 'RealMaster', status: 'blocked' })],
        }),
        makeRow('SockB', {
          lock: false,
          tags: [new SockpuppetTag({ master: 'SomeoneElse', status: 'blocked' })],
        }),
      ];

      expect(await getRequestedLockMaster(rows, 'Foo')).toBe('RealMaster');
    });
  });
});

describe('spiHelperPerformActions', () => {
  afterEach(() => {
    mock.restore();
  });

  describe('user action edit summary', () => {
    function makeSingleSectionState() {
      const section = new SectionEntry(1, '09 July 2020');
      section._text = '===09 July 2020===\n{{SPI case status|}}\nEvidence about SockA.\n----';

      const state = new CaseState([section]);
      state._text = section._text;
      state.selectedSection = { type: 'single', section };
      state.archiveNotice = new ParsedArchiveNotice({ username: 'Foo' });
      return state;
    }

    /** Runs a case closing edit alongside the given accounts and returns the edit summary */
    async function getSummaryForAccounts(accounts: UserRow[]) {
      const state = makeSingleSectionState();

      const actions = getInitialCaseActions();
      actions.block.enabled = true;
      actions.block.data.master = 'Master';
      actions.status.enabled = true;
      actions.status.data.old = 'open';
      actions.status.data.new = 'closed';

      const editSpy = spyOn(context, 'edit').mockResolvedValue(999);

      await spiHelperPerformActions({ actions, accounts, state });

      return editSpy.mock.calls[0]?.[0].summary;
    }

    test('reports how many accounts were blocked, tagged and locked', async () => {
      stubUserActions();
      spyOn(blockModule, 'spiHelperProcessBlockRow').mockResolvedValue(true);
      spyOn(lockModule, 'spiHelperRequestLocks').mockResolvedValue(['SockA']);

      const summary = await getSummaryForAccounts([
        makeRow('SockA', {
          lock: true,
          tags: [new SockpuppetTag({ master: 'Master', status: 'blocked' })],
        }),
        makeRow('SockB', {
          tags: [new SockpuppetTag({ master: 'Master', status: 'blocked' })],
        }),
      ]);

      expect(summary).toBe(
        '/* 09 July 2020 */ Blocking and tagging 2 accounts, requesting 1 lock, closing case',
      );
    });

    test('counts what actually landed, not what was requested', async () => {
      stubUserActions();
      // SockA blocks fine, SockB's block fails, which also cancels SockB's tag
      spyOn(blockModule, 'spiHelperProcessBlockRow').mockImplementation(
        ({ sock }) => Promise.resolve(sock.username === 'SockA'),
      );

      const summary = await getSummaryForAccounts([
        makeRow('SockA', { tags: [new SockpuppetTag({ master: 'Master', status: 'blocked' })] }),
        makeRow('SockB', { tags: [new SockpuppetTag({ master: 'Master', status: 'blocked' })] }),
      ]);

      // Singular noun, and SockB is absent from both counts
      expect(summary).toBe('/* 09 July 2020 */ Blocking and tagging 1 account, closing case');
    });

    test('omits the user action phrases when nothing was blocked, tagged or locked', async () => {
      stubUserActions({ isAdmin: false });

      const summary = await getSummaryForAccounts([makeRow('SockA', { block: false })]);

      expect(summary).toBe('/* 09 July 2020 */ Closing case');
    });
  });

  describe('multi-section selection', () => {
    function makeMultiSectionState() {
      const section1 = new SectionEntry(1, '09 July 2020');
      const section2 = new SectionEntry(2, '15 August 2020');
      section1._text = '===09 July 2020===\n{{SPI case status|}}\nEvidence about SockA.\n----';
      section2._text = '===15 August 2020===\n{{SPI case status|}}\nEvidence about SockB.\n----';

      const state = new CaseState([section1, section2]);
      state._text = section1._text + '\n' + section2._text;
      state.selectedSection = { type: 'multiple', sections: [section1, section2] };
      state.archiveNotice = new ParsedArchiveNotice({ username: 'Foo' });
      return { state, section1, section2 };
    }

    test('splices each section\'s own comment/status change into a single combined edit', async () => {
      const { state } = makeMultiSectionState();

      const actions = getInitialCaseActions();
      actions.block.data.master = 'Master';
      actions.comment.enabled = true;
      actions.comment.data.bySection.set(1, { text: '* Closing per consensus', enabled: true });
      actions.comment.data.bySection.set(2, { text: '* Blocked as sock', enabled: true });
      actions.status.enabled = true;
      actions.status.data.bySection.set(1, { old: 'open', new: 'closed', enabled: true });
      // The second section's status is left as 'nochange' - its status template must stay untouched
      actions.status.data.bySection.set(2, { old: 'CUrequest', new: 'nochange', enabled: true });

      const editSpy = spyOn(context, 'edit').mockResolvedValue(999);

      await spiHelperPerformActions({ actions, accounts: [], state });

      expect(editSpy).toHaveBeenCalledTimes(1);
      const call = editSpy.mock.calls[0]?.[0];
      // Whole-page edit: no single MediaWiki section can represent two changed sections
      expect(call?.sectionId).toBeNull();
      expect(call?.newText).toContain('===09 July 2020===\n{{SPI case status|closed}}');
      expect(call?.newText).toContain('Closing per consensus');
      expect(call?.newText).toContain('Blocked as sock');
      expect(call?.newText).toContain('===15 August 2020===\n{{SPI case status|}}');
      // Closing gets its own summary phrase rather than the generic "changing status"
      expect(call?.summary).toBe('Commenting on 2 sections, closing 1 section');
      expect(call?.summary).not.toContain('changing status');
    });

    test('summary distinguishes closed sections from other status changes when both occur', async () => {
      const { state } = makeMultiSectionState();

      const actions = getInitialCaseActions();
      actions.block.data.master = 'Master';
      actions.status.enabled = true;
      actions.status.data.bySection.set(1, { old: 'open', new: 'closed', enabled: true });
      actions.status.data.bySection.set(2, { old: 'CUrequest', new: 'cudecline', enabled: true });

      const editSpy = spyOn(context, 'edit').mockResolvedValue(999);

      await spiHelperPerformActions({ actions, accounts: [], state });

      const call = editSpy.mock.calls[0]?.[0];
      expect(call?.summary).toBe('Changing status on 1 section, closing 1 section');
    });

    test('does not touch a section with neither comment nor status enabled for it', async () => {
      const { state } = makeMultiSectionState();

      const actions = getInitialCaseActions();
      actions.block.data.master = 'Master';
      actions.comment.enabled = true;
      actions.comment.data.bySection.set(1, { text: '* Closing per consensus', enabled: true });
      // Section 2 has no comment/status entry at all

      const editSpy = spyOn(context, 'edit').mockResolvedValue(999);

      await spiHelperPerformActions({ actions, accounts: [], state });

      const call = editSpy.mock.calls[0]?.[0];
      expect(call?.newText).toContain('Closing per consensus');
      expect(call?.newText).toContain('===15 August 2020===\n{{SPI case status|}}\nEvidence about SockB.\n----');
    });

    // Regression test: comment/status bySection entries used to share a single top-level
    // enabled flag, so toggling one section's comment/status also enabled the other's.
    test('a section with enabled: false is skipped even though its bySection value has content set', async () => {
      const { state } = makeMultiSectionState();

      const actions = getInitialCaseActions();
      actions.block.data.master = 'Master';
      actions.comment.enabled = true;
      actions.status.enabled = true;
      actions.comment.data.bySection.set(1, { text: '* Closing per consensus', enabled: true });
      actions.comment.data.bySection.set(2, { text: '* Blocked as sock', enabled: false });
      actions.status.data.bySection.set(1, { old: 'open', new: 'closed', enabled: true });
      actions.status.data.bySection.set(2, { old: 'CUrequest', new: 'cudecline', enabled: false });

      const editSpy = spyOn(context, 'edit').mockResolvedValue(999);

      await spiHelperPerformActions({ actions, accounts: [], state });

      const call = editSpy.mock.calls[0]?.[0];
      expect(call?.newText).toContain('===09 July 2020===\n{{SPI case status|closed}}');
      expect(call?.newText).toContain('Closing per consensus');
      // Section 2 is disabled, so neither its comment nor its status change should land,
      // even though both have real (non-default) values set.
      expect(call?.newText).not.toContain('Blocked as sock');
      expect(call?.newText).toContain('===15 August 2020===\n{{SPI case status|}}\nEvidence about SockB.\n----');
    });

    test('groups the log entry by section instead of repeating "for section X" per line', async () => {
      const { state } = makeMultiSectionState();

      const actions = getInitialCaseActions();
      actions.block.data.master = 'Master';
      actions.comment.enabled = true;
      actions.status.enabled = true;
      actions.comment.data.bySection.set(1, { text: '* Closing per consensus', enabled: true });
      actions.comment.data.bySection.set(2, { text: '* Blocked as sock', enabled: true });
      actions.status.data.bySection.set(1, { old: 'open', new: 'closed', enabled: true });
      // The second section only gets a comment, no status change
      actions.status.data.bySection.set(2, { old: 'CUrequest', new: 'nochange', enabled: true });

      spyOn(context, 'edit').mockResolvedValue(999);
      const logSpy = spyOn(logModule, 'spiHelperLog').mockResolvedValue(undefined);
      const originalLogEnabled = spiHelperSettings.log.enabled;
      spiHelperSettings.log.enabled = true;

      try {
        await spiHelperPerformActions({ actions, accounts: [], state });
      }
      finally {
        spiHelperSettings.log.enabled = originalLogEnabled;
      }

      const logMessage = logSpy.mock.calls[0]?.[0];
      // Each section gets one header, with its own actions nested underneath - not
      // "changed case status ... for section 09 July 2020" / "commented on section 09 July 2020"
      expect(logMessage).toContain('** 09 July 2020\n*** changed case status from open to closed\n*** commented');
      expect(logMessage).toContain('** 15 August 2020\n*** commented');
      expect(logMessage).not.toContain('for section');
    });

    test('does not bail out when only per-section bySection entries are enabled', async () => {
      const { state } = makeMultiSectionState();

      const actions = getInitialCaseActions();
      actions.block.data.master = 'Master';
      // actions.comment.enabled and actions.status.enabled are left at their default false
      actions.comment.data.bySection.set(1, { text: '* Closing per consensus', enabled: true });
      actions.status.data.bySection.set(1, { old: 'open', new: 'closed', enabled: true });

      const editSpy = spyOn(context, 'edit').mockResolvedValue(999);

      await spiHelperPerformActions({ actions, accounts: [], state });

      expect(editSpy).toHaveBeenCalledTimes(1);
      const call = editSpy.mock.calls[0]?.[0];
      expect(call?.newText).toContain('===09 July 2020===\n{{SPI case status|closed}}');
      expect(call?.newText).toContain('Closing per consensus');
    });
  });
});
