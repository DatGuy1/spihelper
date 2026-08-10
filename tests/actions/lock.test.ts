import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test';
import { type EditPageOpts } from './archiveFixtures.ts';

const mockGetPageText = mock((_title: string, _cache: boolean) => Promise.resolve(''));
const mockEditPage = mock((_opts: EditPageOpts) => Promise.resolve<number | null>(1234));

void mock.module('../../src/api.ts', () => ({
  spiHelperGetPageText: mockGetPageText,
  spiHelperEditPage: mockEditPage,
  spiHelperGetPageRev: mock(() => Promise.resolve(0)),
}));

const {
  buildGlobalBlockRequest,
  buildLockRequest,
  buildRequestHeading,
  spiHelperRequestGlobalActions,
} = await import('../../src/actions/lock.ts');
const contextModule = await import('../../src/context.ts');

const MASTER_LINK = '[[Special:CentralAuth/Master|Master]]';

const SRG_TEXT = [
  '== Requests for global (un)block ==',
  '',
  '=== Global block for [[Special:Contributions/192.0.2.1|192.0.2.1]] ===',
  'Cross-wiki abuse. ~~~~',
  '',
  '== Requests for global (un)lock and (un)hiding ==',
  '',
  '=== Global lock for Someone ===',
  'Cross-wiki abuse. ~~~~',
  '',
  '== See also ==',
  '* [[Steward requests]]',
].join('\n');

beforeEach(() => {
  contextModule.setContext('Wikipedia:Sockpuppet investigations/Master');
  mockGetPageText.mockReset().mockResolvedValue(SRG_TEXT);
  mockEditPage.mockReset().mockResolvedValue(1234);
});

afterEach(() => {
  mock.restore();
});

describe('buildRequestHeading', () => {
  describe('socks only', () => {
    test('drops the count for a single sock', () => {
      expect(buildRequestHeading({ targets: ['SockA'], master: 'Master', hideNames: false }))
        .toEqual({ heading: `${MASTER_LINK} sock`, headingText: 'Master sock' });
    });

    test('counts multiple socks', () => {
      expect(buildRequestHeading({
        targets: ['SockA', 'SockB', 'SockC'], master: 'Master', hideNames: false,
      })).toEqual({
        heading: `3 ${MASTER_LINK} socks`, headingText: '3 Master socks',
      });
    });
  });

  describe('master is a target too', () => {
    test('names the master alone when they are the only target', () => {
      expect(buildRequestHeading({ targets: ['Master'], master: 'Master', hideNames: false }))
        .toEqual({ heading: MASTER_LINK, headingText: 'Master' });
    });

    test('does not count the master among their own socks', () => {
      // Three targets, but only two of them are socks of the master
      expect(buildRequestHeading({
        targets: ['Master', 'SockA', 'SockB'], master: 'Master', hideNames: false,
      })).toEqual({
        heading: `${MASTER_LINK} and 2 socks`, headingText: 'Master and 2 socks',
      });
    });

    test('drops the count when the master has a single sock alongside them', () => {
      expect(buildRequestHeading({
        targets: ['Master', 'SockA'], master: 'Master', hideNames: false,
      })).toEqual({
        heading: `${MASTER_LINK} and their sock`, headingText: 'Master and their sock',
      });
    });
  });

  describe('no master to name', () => {
    test('anonymises the heading when names are hidden', () => {
      expect(buildRequestHeading({
        targets: ['SockA', 'SockB'], master: 'Master', hideNames: true,
      })).toEqual({ heading: '2 sockpuppets', headingText: '2 sockpuppets' });
    });

    test('uses "a sockpuppet" rather than a count of one', () => {
      expect(buildRequestHeading({ targets: ['SockA'], master: 'Master', hideNames: true }))
        .toEqual({ heading: 'a sockpuppet', headingText: 'a sockpuppet' });
    });

    test('anonymises the heading when there is no master at all', () => {
      expect(buildRequestHeading({ targets: ['SockA'], master: '', hideNames: false }))
        .toEqual({ heading: 'a sockpuppet', headingText: 'a sockpuppet' });
    });
  });

  describe('link target', () => {
    test('links a master with a global account to CentralAuth', () => {
      expect(buildRequestHeading({
        targets: ['~2026-00000-01'], master: 'Master', hideNames: false,
      }).heading).toBe(`${MASTER_LINK} sock`);
    });

    test('links a temporary account master to contributions, having no global account', () => {
      expect(buildRequestHeading({
        targets: ['~2026-00000-01'], master: '~2026-00000-01', hideNames: false,
      }).heading).toBe('[[Special:Contributions/~2026-00000-01|~2026-00000-01]]');
    });
  });
});

describe('buildLockRequest', () => {
  const base = { master: 'Master', hideNames: false, comment: '' };

  test('uses LockHide for a single target', () => {
    expect(buildLockRequest({ ...base, targets: ['SockA'] })?.body)
      .toContain('* {{LockHide|1=SockA}}');
  });

  test('uses MultiLock for several targets, carrying hidename through', () => {
    expect(buildLockRequest({ ...base, targets: ['SockA', 'SockB'], hideNames: true })?.body)
      .toContain('{{MultiLock|1=SockA|2=SockB|hidename=1}}');
  });

  test('files under the lock section', () => {
    expect(buildLockRequest({ ...base, targets: ['SockA'] })?.kind).toBe('lock');
  });

  test('builds nothing when there is nothing to request', () => {
    expect(buildLockRequest({ ...base, targets: [] })).toBeNull();
  });
});

describe('buildGlobalBlockRequest', () => {
  const base = { master: 'Master', comment: '' };

  test('lists temporary accounts by their central account', () => {
    const body = buildGlobalBlockRequest({
      ...base, targets: ['~2026-00000-01', '~2026-00000-02'],
    })?.body ?? '';
    expect(body).toContain('{{MultiLock|1=~2026-00000-01|2=~2026-00000-02}}');
    expect(body).not.toContain('Luxotool');
  });

  test('lists a lone temporary account with LockHide', () => {
    expect(buildGlobalBlockRequest({ ...base, targets: ['~2026-00000-01'] })?.body)
      .toContain('* {{LockHide|1=~2026-00000-01}}');
  });

  test('lists one Luxotool per IP, having no central account to name', () => {
    const body = buildGlobalBlockRequest({
      ...base, targets: ['192.0.2.1', '198.51.100.0/24'],
    })?.body ?? '';
    expect(body).toContain('* {{Luxotool|192.0.2.1}}');
    expect(body).toContain('* {{Luxotool|198.51.100.0/24}}');
    expect(body).not.toContain('MultiLock');
  });

  test('groups the temporary accounts together in a mixed request', () => {
    const body = buildGlobalBlockRequest({
      ...base, targets: ['~2026-00000-01', '192.0.2.1', '~2026-00000-02'],
    })?.body ?? '';
    expect(body).toContain('{{MultiLock|1=~2026-00000-01|2=~2026-00000-02}}');
    expect(body).toContain('* {{Luxotool|192.0.2.1}}');
  });

  test('doesn\'t hide names', () => {
    const body = buildGlobalBlockRequest({
      ...base, targets: ['~2026-00000-01', '~2026-00000-02'],
    })?.body ?? '';
    expect(body).not.toContain('hidename');
  });

  test('appends the comment as its own sentence', () => {
    const body = buildGlobalBlockRequest({
      ...base,
      targets: ['192.0.2.1'],
      comment: 'Also active on eswiki and Commons.',
    })?.body ?? '';
    expect(body).toContain('see [[:w:en:Wikipedia:Sockpuppet investigations/Master]]. Also active on eswiki and Commons. ~~~~');
  });

  test('files under the block section', () => {
    expect(buildGlobalBlockRequest({ ...base, targets: ['192.0.2.1'] })?.kind).toBe('block');
  });

  test('builds nothing when there is nothing to request', () => {
    expect(buildGlobalBlockRequest({ ...base, targets: [] })).toBeNull();
  });
});

describe('spiHelperRequestGlobalActions', () => {
  const base = { master: 'Master', hideNames: false, comment: '' };

  test('files both requests in a single edit, each under its own section', async () => {
    const filed = await spiHelperRequestGlobalActions({
      ...base, lockTargets: ['SockA'], blockTargets: ['~2026-00000-01'],
    });

    expect(filed).toEqual({ lockedUsers: ['SockA'], globalBlockedUsers: ['~2026-00000-01'] });
    expect(mockEditPage).toHaveBeenCalledTimes(1);

    const newText = mockEditPage.mock.calls[0]?.[0].newText ?? '';
    const lockSectionStart = newText.indexOf('== Requests for global (un)lock and (un)hiding ==');
    // The block request lands above the lock heading, the lock request below it
    expect(newText.indexOf('{{Luxotool|~2026-00000-01}}')).toBeLessThan(lockSectionStart);
    expect(newText.indexOf('{{LockHide|1=SockA}}')).toBeGreaterThan(lockSectionStart);
    expect(newText.indexOf('{{LockHide|1=SockA}}')).toBeLessThan(newText.indexOf('== See also =='));
  });

  test('names both request types in the edit summary', async () => {
    await spiHelperRequestGlobalActions({
      ...base, lockTargets: ['SockA'], blockTargets: ['~2026-00000-01'],
    });

    expect(mockEditPage.mock.calls[0]?.[0].summary)
      .toBe('Global lock and block requests for 2 [[Special:CentralAuth/Master|Master]] socks');
  });

  test('names only the request being made when there is just one', async () => {
    await spiHelperRequestGlobalActions({ ...base, lockTargets: ['SockA'], blockTargets: [] });

    expect(mockEditPage.mock.calls[0]?.[0].summary)
      .toBe('Global lock request for [[Special:CentralAuth/Master|Master]] sock');
  });

  test('files only the lock request when there is nothing to globally block', async () => {
    const filed = await spiHelperRequestGlobalActions({
      ...base, lockTargets: ['SockA'], blockTargets: [],
    });

    expect(filed).toEqual({ lockedUsers: ['SockA'], globalBlockedUsers: [] });
    expect(mockEditPage.mock.calls[0]?.[0].newText).not.toContain('Luxotool|SockA');
  });

  test('makes no edit at all when there is nothing to request', async () => {
    const filed = await spiHelperRequestGlobalActions({
      ...base, lockTargets: [], blockTargets: [],
    });

    expect(filed).toEqual({ lockedUsers: [], globalBlockedUsers: [] });
    expect(mockEditPage).not.toHaveBeenCalled();
  });

  test('reports nothing filed when the edit fails', async () => {
    mockEditPage.mockResolvedValue(null);

    const filed = await spiHelperRequestGlobalActions({
      ...base, lockTargets: ['SockA'], blockTargets: ['~2026-00000-01'],
    });

    expect(filed).toEqual({ lockedUsers: [], globalBlockedUsers: [] });
  });

  test('files neither request when one of the sections is missing', async () => {
    mockGetPageText.mockResolvedValue('== Requests for global (un)lock and (un)hiding ==\n\n== See also ==\n');

    const filed = await spiHelperRequestGlobalActions({
      ...base, lockTargets: ['SockA'], blockTargets: ['~2026-00000-01'],
    });

    expect(filed).toEqual({ lockedUsers: [], globalBlockedUsers: [] });
    expect(mockEditPage).not.toHaveBeenCalled();
  });
});
