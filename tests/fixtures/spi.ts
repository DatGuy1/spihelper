// Builders for the SPI domain objects that the block/link/tag suites all construct.
// Each supplies neutral defaults for suites to layer their own onto, rather than being
// used directly - see the local wrappers in the consuming test files.

import type { BlockEntry, BlockRowData, LinkRowData, UserRow } from '../../src/types';
import { SockpuppetTag } from '../../src/tags.ts';

/**
 * A user row with every checkbox off.
 *
 * The neutral row is rarely what a suite wants directly - block form tests start from an
 * unblocked row, submit tests from an indef - so each suite is expected to wrap this with
 * its own block defaults rather than repeat the full literal.
 */
export function makeUserRow(
  username: string,
  block: Partial<BlockRowData> = {},
  link: Partial<LinkRowData> = {},
): UserRow {
  return {
    id: username,
    username,
    link: {
      analyser: false,
      timeline: false,
      timecard: false,
      pages: false,
      summary: false,
      cuwiki: false,
      interleaved: false,
      ...link,
    },
    block: {
      block: false,
      duration: '',
      acb: false,
      abao: false,
      ntp: false,
      nem: false,
      lock: false,
      tags: [],
      ...block,
    },
  };
}

/** An existing indefinite block with every restriction set, as returned by the API. */
export function makeBlockEntry(username: string, overrides: Partial<BlockEntry> = {}): BlockEntry {
  return {
    username,
    duration: 'infinity',
    acb: true,
    abao: true,
    ntp: true,
    nem: true,
    reason: 'Abusing multiple accounts',
    ...overrides,
  };
}

/** A {{sockpuppet}} tag on master "Foo", blocked, with everything else defaulted. */
export function makeSockTag(
  overrides: Partial<ConstructorParameters<typeof SockpuppetTag>[0]> = {},
): SockpuppetTag {
  return new SockpuppetTag({ master: 'Foo', status: 'blocked', ...overrides });
}
