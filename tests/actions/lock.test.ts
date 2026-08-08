import { describe, expect, test } from 'bun:test';
import { buildLockHeading } from '../../src/actions';

const MASTER_LINK = '[[Special:CentralAuth/Master|Master]]';

describe('buildLockHeading', () => {
  describe('socks only', () => {
    test('drops the count for a single sock', () => {
      expect(buildLockHeading({ lockTargets: ['SockA'], master: 'Master', hideNames: false }))
        .toEqual({ heading: `${MASTER_LINK} sock`, headingText: 'Master sock' });
    });

    test('counts multiple socks', () => {
      expect(buildLockHeading({
        lockTargets: ['SockA', 'SockB', 'SockC'], master: 'Master', hideNames: false,
      })).toEqual({
        heading: `3 ${MASTER_LINK} socks`, headingText: '3 Master socks',
      });
    });
  });

  describe('master is a lock target too', () => {
    test('names the master alone when they are the only target', () => {
      expect(buildLockHeading({ lockTargets: ['Master'], master: 'Master', hideNames: false }))
        .toEqual({ heading: MASTER_LINK, headingText: 'Master' });
    });

    test('does not count the master among their own socks', () => {
      // Three targets, but only two of them are socks of the master
      expect(buildLockHeading({
        lockTargets: ['Master', 'SockA', 'SockB'], master: 'Master', hideNames: false,
      })).toEqual({
        heading: `${MASTER_LINK} and 2 socks`, headingText: 'Master and 2 socks',
      });
    });

    test('drops the count when the master has a single sock alongside them', () => {
      expect(buildLockHeading({
        lockTargets: ['Master', 'SockA'], master: 'Master', hideNames: false,
      })).toEqual({
        heading: `${MASTER_LINK} and their sock`, headingText: 'Master and their sock',
      });
    });

    test('matches the master through normalisation of the target name', () => {
      expect(buildLockHeading({
        lockTargets: [' Master ', 'SockA'], master: 'Master', hideNames: false,
      }).headingText).toBe('Master and their sock');
    });
  });

  describe('no master to name', () => {
    test('anonymises the heading when names are hidden', () => {
      expect(buildLockHeading({
        lockTargets: ['SockA', 'SockB'], master: 'Master', hideNames: true,
      })).toEqual({ heading: '2 sockpuppets', headingText: '2 sockpuppets' });
    });

    test('uses "a sockpuppet" rather than a count of one', () => {
      expect(buildLockHeading({ lockTargets: ['SockA'], master: 'Master', hideNames: true }))
        .toEqual({ heading: 'a sockpuppet', headingText: 'a sockpuppet' });
    });

    test('anonymises the heading when there is no master at all', () => {
      expect(buildLockHeading({ lockTargets: ['SockA'], master: '', hideNames: false }))
        .toEqual({ heading: 'a sockpuppet', headingText: 'a sockpuppet' });
    });
  });
});
