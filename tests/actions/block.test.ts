import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from 'bun:test';
import type { BlockOptions, UserRow } from '../../src/types';
import { SockpuppetTag } from '../../src/types';
import { type EditPageOpts } from '../fixtures/api.ts';
import { makeUserRow as makeBaseUserRow } from '../fixtures/spi.ts';

interface BlockUserOpts {
  user: string; duration: string; reason: string; reblock: boolean;
  anononly: boolean; accountcreation: boolean; autoblock: boolean;
  notalkpage: boolean; noemail: boolean;
  watchBlockedUser: boolean; watchExpiry?: string;
}
const mockBlockUser = mock((_opts: BlockUserOpts) => Promise.resolve(true));
const mockEditPage = mock((_opts: EditPageOpts) => Promise.resolve<number | null>(null));

void mock.module('../../src/api.ts', () => ({
  spiHelperBlockUser: mockBlockUser,
  spiHelperEditPage: mockEditPage,
}));

const {
  buildBlockSummary,
  buildTalkNotice,
  spiHelperAddTalkBlockNotice,
  spiHelperProcessBlockRow,
} = await import('../../src/actions/block.ts');
const contextModule = await import('../../src/context.ts');
const roleModule = await import('../../src/role.ts');
const { spiHelperSettings } = await import('../../src/options');

beforeEach(() => {
  contextModule.setContext('Wikipedia:Sockpuppet investigations/Foo');
  mockBlockUser.mockReset().mockResolvedValue(true);
  mockEditPage.mockReset().mockResolvedValue(null);
});

afterEach(() => {
  mock.restore();
});

const defaultBlockOptions: BlockOptions = {
  noBlock: false,
  override: false,
  tagUnattached: false,
  cuBlock: false,
  cuBlockOnly: false,
  addMasterNotice: false,
  addSockNotice: false,
  blankTalk: false,
  lockHideNames: false,
};

// Blocks here default to indefinite, the duration most of these cases exercise
const makeSock = (
  overrides: Partial<UserRow['block']> = {}, username = 'Vandal',
): UserRow => makeBaseUserRow(username, { duration: 'indefinite', ...overrides });

describe('buildTalkNotice', () => {
  test('sock notice uses the sockpuppet header', () => {
    const text = buildTalkNotice({
      sock: makeSock({ duration: '1 week' }),
      noticeType: 'sock',
      cuBlock: false,
    });
    expect(text.startsWith('== Blocked as a sockpuppet ==\n')).toBe(true);
  });

  test('master notice uses the sockpuppetry header', () => {
    const text = buildTalkNotice({
      sock: makeSock({ duration: '1 week' }),
      noticeType: 'master',
      cuBlock: false,
    });
    expect(text.startsWith('== Blocked for sockpuppetry ==\n')).toBe(true);
  });

  test('sock notice falls back to the master header when the sock is the sockmaster itself', () => {
    const text = buildTalkNotice({
      sock: makeSock({ duration: '1 week' }, 'Vandal'),
      noticeType: 'sock',
      sockmaster: 'Vandal',
      cuBlock: false,
    });
    expect(text.startsWith('== Blocked for sockpuppetry ==\n')).toBe(true);
    expect(text).not.toContain('|master=');
  });

  test('non-CU block uses the uw-sockblock template', () => {
    const text = buildTalkNotice({
      sock: makeSock({ duration: '1 week' }),
      noticeType: 'sock',
      cuBlock: false,
    });
    expect(text).toContain('{{subst:uw-sockblock|sig=yes');
  });

  test('CU block uses the checkuserblock-account template', () => {
    const text = buildTalkNotice({
      sock: makeSock({ duration: '1 week' }),
      noticeType: 'sock',
      cuBlock: true,
    });
    expect(text).toContain('{{checkuserblock-account|sig=~~~~');
  });

  test('includes the SPI page when the context is valid', () => {
    const text = buildTalkNotice({
      sock: makeSock({ duration: '1 week' }),
      noticeType: 'sock',
      cuBlock: false,
    });
    expect(text).toContain('|spi=Foo');
  });

  test('omits the SPI page when the context is invalid', () => {
    contextModule.setContext('');
    const text = buildTalkNotice({
      sock: makeSock({ duration: '1 week' }),
      noticeType: 'sock',
      cuBlock: false,
    });
    expect(text).not.toContain('|spi=');
  });

  test('indefinite blocks use indef=yes instead of a time parameter', () => {
    const text = buildTalkNotice({
      sock: makeSock({ duration: 'indefinite' }),
      noticeType: 'sock',
      cuBlock: false,
    });
    expect(text).toContain('|indef=yes');
    expect(text).not.toContain('|time=');
  });

  test('finite blocks use time= with the given duration', () => {
    const text = buildTalkNotice({
      sock: makeSock({ duration: '2 weeks' }),
      noticeType: 'sock',
      cuBlock: false,
    });
    expect(text).toContain('|time=2 weeks');
    expect(text).not.toContain('|indef=');
  });

  test('finite CU blocks additionally add indef=no', () => {
    const text = buildTalkNotice({
      sock: makeSock({ duration: '2 weeks' }),
      noticeType: 'sock',
      cuBlock: true,
    });
    expect(text).toContain('|time=2 weeks');
    expect(text).toContain('|indef=no');
  });

  test('finite non-CU blocks do not add indef=no', () => {
    const text = buildTalkNotice({
      sock: makeSock({ duration: '2 weeks' }),
      noticeType: 'sock',
      cuBlock: false,
    });
    expect(text).not.toContain('|indef=no');
  });

  test('adds notalk=yes when the sock has notalkpage set', () => {
    const text = buildTalkNotice({
      sock: makeSock({ duration: '1 week', ntp: true }),
      noticeType: 'sock',
      cuBlock: false,
    });
    expect(text).toContain('|notalk=yes');
  });

  test('omits notalk when the sock does not have notalkpage set', () => {
    const text = buildTalkNotice({
      sock: makeSock({ duration: '1 week', ntp: false }),
      noticeType: 'sock',
      cuBlock: false,
    });
    expect(text).not.toContain('|notalk=');
  });

  test('sock notices with a distinct sockmaster include master=', () => {
    const text = buildTalkNotice({
      sock: makeSock({ duration: '1 week' }, 'Vandal'),
      noticeType: 'sock',
      sockmaster: 'Sockmaster',
      cuBlock: false,
    });
    expect(text).toContain('|master=Sockmaster');
  });

  test('master notices never include master= even when a sockmaster is given', () => {
    const text = buildTalkNotice({
      sock: makeSock({ duration: '1 week' }, 'Sockmaster'),
      noticeType: 'master',
      sockmaster: 'Sockmaster',
      cuBlock: false,
    });
    expect(text).not.toContain('|master=');
  });

  test('closes the template with a trailing brace', () => {
    const text = buildTalkNotice({
      sock: makeSock({ duration: '1 week' }),
      noticeType: 'sock',
      cuBlock: false,
    });
    expect(text.endsWith('}}')).toBe(true);
  });
});

describe('buildBlockSummary', () => {
  test('base summary links the SPI page when the context is valid', () => {
    spyOn(roleModule, 'spiHelperIsCheckuser').mockReturnValue(false);
    const summary = buildBlockSummary(defaultBlockOptions, false, false, false);
    expect(summary).toBe(
      `Abusing [[WP:SOCK|multiple accounts]]: Please see: [[${contextModule.context.prefixedName}]]`,
    );
  });

  test('omits the SPI link when the context is invalid', () => {
    contextModule.setContext('');
    spyOn(roleModule, 'spiHelperIsCheckuser').mockReturnValue(false);
    const summary = buildBlockSummary(defaultBlockOptions, false, false, false);
    expect(summary).toBe('Abusing [[WP:SOCK|multiple accounts]]');
  });

  test('checkuser account block prefixes the checkuserblock-account template', () => {
    spyOn(roleModule, 'spiHelperIsCheckuser').mockReturnValue(true);
    const cuOptions = { ...defaultBlockOptions, cuBlock: true };
    const summary = buildBlockSummary(cuOptions, false, false, false);
    expect(summary.startsWith('{{checkuserblock-account}}: Abusing')).toBe(true);
  });

  test('checkuser IP block prefixes the plain checkuserblock template', () => {
    spyOn(roleModule, 'spiHelperIsCheckuser').mockReturnValue(true);
    const cuOptions = { ...defaultBlockOptions, cuBlock: true };
    const summary = buildBlockSummary(cuOptions, true, false, false);
    expect(summary.startsWith('{{checkuserblock}}: Abusing')).toBe(true);
  });

  test('cuBlockOnly replaces the summary entirely with just the CU template', () => {
    spyOn(roleModule, 'spiHelperIsCheckuser').mockReturnValue(true);
    const summary = buildBlockSummary(
      { ...defaultBlockOptions, cuBlock: true, cuBlockOnly: true }, false, false, false,
    );
    expect(summary).toBe('{{checkuserblock-account}}');
  });

  test('does not use the CU template when the user is not a checkuser', () => {
    spyOn(roleModule, 'spiHelperIsCheckuser').mockReturnValue(false);
    const cuOptions = { ...defaultBlockOptions, cuBlock: true };
    const summary = buildBlockSummary(cuOptions, false, false, false);
    expect(summary).not.toContain('checkuserblock');
  });

  test('IP range blocks are wrapped in {{rangeblock}} with create=yes when account creation is not blocked', () => {
    spyOn(roleModule, 'spiHelperIsCheckuser').mockReturnValue(false);
    const summary = buildBlockSummary(defaultBlockOptions, true, true, false);
    expect(summary).toBe(
      `{{rangeblock|1=Abusing [[WP:SOCK|multiple accounts]]: Please see: [[${contextModule.context.prefixedName}]]|create=yes}}`,
    );
  });

  test('IP range blocks omit create=yes when account creation is already blocked', () => {
    spyOn(roleModule, 'spiHelperIsCheckuser').mockReturnValue(false);
    const summary = buildBlockSummary(defaultBlockOptions, true, true, true);
    expect(summary).not.toContain('create=yes');
    expect(summary.startsWith('{{rangeblock|1=')).toBe(true);
  });

  test('a single (non-range) IP block is not wrapped in {{rangeblock}}', () => {
    spyOn(roleModule, 'spiHelperIsCheckuser').mockReturnValue(false);
    const summary = buildBlockSummary(defaultBlockOptions, true, false, false);
    expect(summary).not.toContain('rangeblock');
  });
});

function makeUserRow(username: string, block: Partial<UserRow['block']> = {}): UserRow {
  return makeSock(block, username);
}

describe('spiHelperProcessBlockRow', () => {
  test('for a registered account, abao maps to autoblock and not anononly', async () => {
    spyOn(mw.util, 'isIPAddress').mockReturnValue(false);
    const sock = makeUserRow('Vandal', { duration: '1 week', abao: true, acb: true, ntp: true, nem: true });

    await spiHelperProcessBlockRow({ sock, blockOptions: defaultBlockOptions });

    expect(mockBlockUser).toHaveBeenCalledWith(expect.objectContaining({
      user: 'Vandal',
      duration: '1 week',
      anononly: false,
      autoblock: true,
      accountcreation: true,
      notalkpage: true,
      noemail: true,
      reblock: false,
    }));
  });

  test('for a single IP, abao maps to anononly and not autoblock', async () => {
    spyOn(mw.util, 'isIPAddress').mockReturnValue(true);
    const sock = makeUserRow('192.0.2.1', { duration: '1 week', abao: true });

    await spiHelperProcessBlockRow({ sock, blockOptions: defaultBlockOptions });

    expect(mockBlockUser).toHaveBeenCalledWith(expect.objectContaining({
      anononly: true,
      autoblock: false,
    }));
  });

  test('passes reblock=true when override is set', async () => {
    const sock = makeUserRow('Vandal', { duration: '1 week' });

    await spiHelperProcessBlockRow({
      sock, blockOptions: { ...defaultBlockOptions, override: true },
    });

    expect(mockBlockUser).toHaveBeenCalledWith(expect.objectContaining({ reblock: true }));
  });

  test('passes through the watch settings and the result of the block call', async () => {
    mockBlockUser.mockResolvedValue(false);
    const sock = makeUserRow('Vandal', { duration: '1 week' });

    const result = await spiHelperProcessBlockRow({ sock, blockOptions: defaultBlockOptions });

    expect(mockBlockUser).toHaveBeenCalledWith(expect.objectContaining({
      watchBlockedUser: spiHelperSettings.watch.blocked,
      watchExpiry: spiHelperSettings.expiry.blocked,
    }));
    expect(result).toBe(false);
  });
});

describe('spiHelperAddTalkBlockNotice', () => {
  const originalUseCheckuserblockAccount = spiHelperSettings.useCheckuserblockAccount;

  afterEach(() => {
    spiHelperSettings.useCheckuserblockAccount = originalUseCheckuserblockAccount;
  });

  test('does not edit the talk page when there are no notices to add', async () => {
    const sock = makeUserRow('Vandal', { duration: '1 week' });

    await spiHelperAddTalkBlockNotice({
      sock, blockOptions: defaultBlockOptions, userTalkContent: 'Existing content', talkNotices: [],
    });

    expect(mockEditPage).not.toHaveBeenCalled();
  });

  test('preserves existing talk page content when blankTalk is off', async () => {
    const sock = makeUserRow('Vandal', { duration: '1 week' });

    await spiHelperAddTalkBlockNotice({
      sock, blockOptions: defaultBlockOptions, userTalkContent: 'Existing content', talkNotices: ['sock'],
    });

    const newText = mockEditPage.mock.calls[0]?.[0].newText;
    expect(newText?.startsWith('Existing content\n')).toBe(true);
  });

  test('discards existing talk page content when blankTalk is on', async () => {
    const sock = makeUserRow('Vandal', { duration: '1 week' });

    await spiHelperAddTalkBlockNotice({
      sock,
      blockOptions: { ...defaultBlockOptions, blankTalk: true },
      userTalkContent: 'Existing content',
      talkNotices: ['sock'],
    });

    const newText = mockEditPage.mock.calls[0]?.[0].newText;
    expect(newText).not.toContain('Existing content');
  });

  test('appends one notice per requested type, in order', async () => {
    const sock = makeUserRow('Vandal', { duration: '1 week' });

    await spiHelperAddTalkBlockNotice({
      sock, blockOptions: defaultBlockOptions, userTalkContent: '', talkNotices: ['master', 'sock'],
    });

    const newText = mockEditPage.mock.calls[0]?.[0].newText ?? '';
    const masterIndex = newText.indexOf('Blocked for sockpuppetry');
    const sockIndex = newText.indexOf('Blocked as a sockpuppet');
    expect(masterIndex).toBeGreaterThanOrEqual(0);
    expect(sockIndex).toBeGreaterThan(masterIndex);
  });

  test('includes the sockmaster from the tag on the row', async () => {
    const sock = makeUserRow('Flunky', {
      duration: '1 week',
      tags: [new SockpuppetTag({ master: 'Kingpin', status: 'blocked' })],
    });

    await spiHelperAddTalkBlockNotice({
      sock, blockOptions: defaultBlockOptions, userTalkContent: '', talkNotices: ['sock'],
    });

    const newText = mockEditPage.mock.calls[0]?.[0].newText ?? '';
    expect(newText).toContain('|master=Kingpin');
  });

  test('only uses the CU template when checkuser, cuBlock, and the useCheckuserblockAccount setting all agree', async () => {
    spyOn(roleModule, 'spiHelperIsCheckuser').mockReturnValue(true);
    spiHelperSettings.useCheckuserblockAccount = true;
    const sock = makeUserRow('Vandal', { duration: '1 week' });

    await spiHelperAddTalkBlockNotice({
      sock, blockOptions: { ...defaultBlockOptions, cuBlock: true }, userTalkContent: '', talkNotices: ['sock'],
    });

    const newText = mockEditPage.mock.calls[0]?.[0].newText ?? '';
    expect(newText).toContain('{{checkuserblock-account|sig=~~~~');
  });

  test('falls back to the uw-sockblock template when useCheckuserblockAccount is off', async () => {
    spyOn(roleModule, 'spiHelperIsCheckuser').mockReturnValue(true);
    spiHelperSettings.useCheckuserblockAccount = false;
    const sock = makeUserRow('Vandal', { duration: '1 week' });

    await spiHelperAddTalkBlockNotice({
      sock, blockOptions: { ...defaultBlockOptions, cuBlock: true }, userTalkContent: '', talkNotices: ['sock'],
    });

    const newText = mockEditPage.mock.calls[0]?.[0].newText ?? '';
    expect(newText).toContain('{{subst:uw-sockblock|sig=yes');
  });

  test('edits the correct talk page with watch=nochange', async () => {
    const sock = makeUserRow('Vandal', { duration: '1 week' });

    await spiHelperAddTalkBlockNotice({
      sock, blockOptions: defaultBlockOptions, userTalkContent: '', talkNotices: ['sock'],
    });

    expect(mockEditPage).toHaveBeenCalledWith(expect.objectContaining({
      title: 'User talk:Vandal',
      watch: 'nochange',
      createonly: false,
    }));
  });
});
