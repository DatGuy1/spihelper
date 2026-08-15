import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from 'bun:test';
import type { BlockActionData, PrefetchedUser, UserRow } from '../../../src/types';
import { AlternateViewComponent } from '../../../src/ui/views/alternateView.ts';
import { CaseState } from '../../../src/state.ts';
import { generateUserRow } from '../../../src/ui/utils.ts';
import { messages } from '../../../src/ui/messages.ts';
import { setContext } from '../../../src/context.ts';
import { setupBlockActionData } from '../../../src/utils.ts';

interface TestCtx {
  accounts: UserRow[];
  blockData: BlockActionData;
  actionsRunning: boolean;
}

const methods = AlternateViewComponent.methods as unknown as {
  onSubmitActions(this: TestCtx): Promise<void>;
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
  return { accounts, blockData, actionsRunning: false };
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
