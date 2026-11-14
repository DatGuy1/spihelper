import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from 'bun:test';
import type {
  BlockActionData,
  CaseAction,
  CaseReport,
  PrefetchedUser,
  SubmitFormActions,
  UserRow,
} from '../../../src/types';
import { AlternateViewComponent } from '../../../src/ui/views';
import * as apiModule from '../../../src/api.ts';
import * as caseActionsModule from '../../../src/caseActions.ts';
import * as sectionModule from '../../../src/ui/views/top/utils/section.ts';
import { CaseState } from '../../../src/state.ts';
import { generateUserRow } from '../../../src/ui/utils.ts';
import { getInitialCaseReport } from '../../../src/ui/views/top/utils';
import { messages } from '../../../src/ui/messages.ts';
import { setContext } from '../../../src/context.ts';
import { setupBlockActionData } from '../../../src/utils.ts';

interface TestCtx {
  accounts: UserRow[];
  blockData: BlockActionData;
  report: CaseAction<CaseReport>;
  caseActions: SubmitFormActions;
  actionsRunning: boolean;
}

const methods = AlternateViewComponent.methods as unknown as {
  onSubmitActions(this: TestCtx): Promise<void>;
};
const computed = AlternateViewComponent.computed as unknown as {
  caseActions(this: Omit<TestCtx, 'caseActions'>): SubmitFormActions;
};

/** A cache entry for someone we looked up and found unblocked, untagged and unlocked */
const nothingFound: PrefetchedUser = {
  block: undefined,
  userPage: undefined,
  globalUser: undefined,
  globalBlock: undefined,
};

function makeCtx(accounts: UserRow[] = []): TestCtx {
  const blockData = setupBlockActionData();
  blockData.fetchedUsers.set('Sock', { ...nothingFound });
  const base = {
    accounts,
    blockData,
    report: { enabled: false, data: getInitialCaseReport() },
    actionsRunning: false,
  };
  // The real computed, so the context can't drift from what the view submits
  return { ...base, caseActions: computed.caseActions.call(base) };
}

let post: ReturnType<typeof spyOn<typeof mw.Api.prototype, 'post'>>;

beforeEach(() => {
  setContext('Wikipedia:Sockpuppet investigations/Foo');
  (mw as unknown as { track: () => void }).track = () => { /* no-op */ };
  post = spyOn(mw.Api.prototype, 'post');
});

afterEach(() => {
  mock.restore();
});

describe('onSubmitActions', () => {
  // fetchedUsers gates whether prefetchSockRows goes to the API at all, so leaving it
  // populated means the blocks and tags this run just wrote are never picked up, and
  // userBlocks/userLocks keep describing the state from before the run
  test('drops the prefetch cache so the next lookup sees what the run wrote', async () => {
    const ctx = makeCtx();

    await methods.onSubmitActions.call(ctx);

    expect(messages.map(message => message.type)).toContain('success');
    expect(ctx.blockData.fetchedUsers.size).toBe(0);
    expect(ctx.actionsRunning).toBe(false);
  });

  test('drops it after a failed run too, since we cannot tell how far we got', async () => {
    // One account is enough to reach the pre-flight lookups, which now surface a failure
    // instead of carrying on with partial data
    post.mockRejectedValue(new Error('network'));
    const ctx = makeCtx([generateUserRow('Sock', new CaseState([]))]);

    await methods.onSubmitActions.call(ctx);

    expect(messages.map(message => message.type)).toContain('error');
    expect(ctx.blockData.fetchedUsers.size).toBe(0);
    expect(ctx.actionsRunning).toBe(false);
  });
});

describe('filing a report', () => {
  interface FilingCtx extends TestCtx {
    view: 'checkuser';
    discardReport: ReturnType<typeof mock>;
  }
  const filingMethods = AlternateViewComponent.methods as unknown as {
    onSubmitActions(this: FilingCtx): Promise<void>;
  };

  let track: ReturnType<typeof mock>;
  let fileAndAct: ReturnType<typeof spyOn<typeof caseActionsModule, 'spiHelperFileAndAct'>>;

  beforeEach(() => {
    track = mock();
    (mw as unknown as { track: () => void }).track = track;
    fileAndAct = spyOn(caseActionsModule, 'spiHelperFileAndAct');
  });

  afterEach(() => {
    fileAndAct.mockRestore();
  });

  function makeFilingCtx(): FilingCtx {
    return { ...makeCtx(), view: 'checkuser', discardReport: mock() };
  }

  test('counts a report once it is filed, with the view it came from', async () => {
    fileAndAct.mockResolvedValue(999);
    const ctx = makeFilingCtx();

    await filingMethods.onSubmitActions.call(ctx);

    expect(track).toHaveBeenCalledWith('stats.mediawiki_gadget_spihelper_total', 1, {
      action: 'file', type: 'alternate', view: 'checkuser',
    });
    expect(ctx.discardReport).toHaveBeenCalled();
  });

  test('does not count a report that failed to save', async () => {
    fileAndAct.mockResolvedValue(null);

    await filingMethods.onSubmitActions.call(makeFilingCtx());

    expect(track).not.toHaveBeenCalledWith(
      'stats.mediawiki_gadget_spihelper_total', 1, expect.objectContaining({ action: 'file' }),
    );
  });
});

describe('openSpamSection', () => {
  interface SectionCtx {
    open: boolean;
    accountsLoading: boolean;
    caseLoaded: boolean;
    accounts: UserRow[];
    blockData: BlockActionData;
    state: CaseState;
    setOpen: ReturnType<typeof mock>;
    loadCase: ReturnType<typeof mock>;
  }
  const sectionMethods = AlternateViewComponent.methods as unknown as {
    openSpamSection(this: SectionCtx, sectionId: number): Promise<void>;
  };

  let getRevision: ReturnType<typeof spyOn<typeof apiModule, 'spiHelperGetPageRevision'>>;
  let prefetch: ReturnType<typeof spyOn<typeof sectionModule, 'prefetchSockRows'>>;

  beforeEach(() => {
    spyOn(mw.config, 'get').mockImplementation(
      ((key: string) => (key === 'wgPageName' ? 'Wikipedia_talk:WikiProject_Spam' : null)) as typeof mw.config.get,
    );
    getRevision = spyOn(apiModule, 'spiHelperGetPageRevision');
    // Hand the rows straight back, so the test sees what was parsed out of the section
    prefetch = spyOn(sectionModule, 'prefetchSockRows').mockImplementation(
      ({ likelySocks, possibleSocks }) => Promise.resolve([...likelySocks, ...possibleSocks]),
    );
  });

  afterEach(() => {
    getRevision.mockRestore();
    prefetch.mockRestore();
  });

  function makeSectionCtx(accounts: UserRow[] = []): SectionCtx {
    return {
      open: false,
      accountsLoading: false,
      caseLoaded: false,
      accounts,
      blockData: setupBlockActionData(),
      state: new CaseState(),
      setOpen: mock(),
      loadCase: mock(() => Promise.resolve()),
    };
  }

  /** A fetched section with this wikitext */
  function section(text: string) {
    return { text, revid: 1 };
  }

  test('reads the clicked section of this page', async () => {
    getRevision.mockResolvedValue(section(''));

    await sectionMethods.openSpamSection.call(makeSectionCtx(), 3);

    expect(getRevision).toHaveBeenCalledWith('Wikipedia_talk:WikiProject_Spam', false, 3);
  });

  test('replaces the table with the accounts in the section, none set to block', async () => {
    getRevision.mockResolvedValue(section('*{{usm|Alice}}\n*{{user summary|Bob}}\n{{lsm|example.com}}'));
    const ctx = makeSectionCtx([generateUserRow('Carol', new CaseState())]);

    await sectionMethods.openSpamSection.call(ctx, 1);

    expect(ctx.accounts.map(row => row.username)).toEqual(['Alice', 'Bob']);
    expect(prefetch.mock.calls[0]?.[0].likelySocks).toEqual([]);
    expect(ctx.accountsLoading).toBe(false);
  });

  test('opens the panel and loads an empty case the first time', async () => {
    getRevision.mockResolvedValue(section('{{usm|Alice}}'));
    const ctx = makeSectionCtx();

    await sectionMethods.openSpamSection.call(ctx, 1);

    expect(ctx.setOpen).toHaveBeenCalledWith(true);
    expect(ctx.loadCase).toHaveBeenCalledWith(false);
  });

  test('leaves the table alone when the section cannot be read', async () => {
    getRevision.mockResolvedValue(null);
    const ctx = makeSectionCtx([generateUserRow('Carol', new CaseState())]);

    await sectionMethods.openSpamSection.call(ctx, 1);

    expect(ctx.accounts.map(row => row.username)).toEqual(['Carol']);
    expect(messages.map(message => message.type)).toContain('error');
  });

  test('ignores a click while another section is still loading', async () => {
    const ctx = { ...makeSectionCtx(), accountsLoading: true };

    await sectionMethods.openSpamSection.call(ctx, 1);

    expect(getRevision).not.toHaveBeenCalled();
  });
});
