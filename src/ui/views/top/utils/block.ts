import type { BlockEntry, BlockRowData } from '../../../../types';
import { RELATIVE_EXPIRY_REGEX, isAbsoluteExpiry, isNoExpiry } from '../../../../utils.ts';

const MS_PER_SECOND = 1000;
const MS_PER_DAY = 24 * 60 * 60 * MS_PER_SECOND;
const MS_PER_FIXED_UNIT: Record<string, number | undefined> = {
  second: MS_PER_SECOND,
  minute: 60 * MS_PER_SECOND,
  hour: 60 * 60 * MS_PER_SECOND,
  day: MS_PER_DAY,
  week: 7 * MS_PER_DAY,
};

function addRelativeExpiry(from: Date, amount: number, unit: string): number {
  // Recreation of PHP's logic
  const fixedUnit = MS_PER_FIXED_UNIT[unit];
  if (fixedUnit !== undefined) {
    return from.getTime() + amount * fixedUnit;
  }
  const whole = Math.floor(amount);
  const fraction = amount - whole;
  const end = new Date(from.getTime());
  if (unit === 'month') {
    end.setUTCMonth(end.getUTCMonth() + whole);
    return end.getTime() + fraction * 30.44 * MS_PER_DAY;
  }
  end.setUTCFullYear(end.getUTCFullYear() + whole);
  return end.getTime() + fraction * 365.25 * MS_PER_DAY;
}

/**
 * Resolves an expiry to the absolute time it ends at, in milliseconds since the epoch.
 * Relative expiries ("2 weeks") are measured from `from`, absolute ones are used as given.
 *
 * @return Infinity for expiries that never end, null if the value can't be parsed
 */
export function expiryToTimestamp(expiry: string, from: Date = new Date()): number | null {
  if (isNoExpiry(expiry)) return Infinity;
  if (isAbsoluteExpiry(expiry)) {
    const parsed = Date.parse(expiry);
    return isNaN(parsed) ? null : parsed;
  }
  const relativeMatch = RELATIVE_EXPIRY_REGEX.exec(expiry);
  if (!relativeMatch) return null;
  const [, rawAmount = '', rawUnit = ''] = relativeMatch;
  const amount = Number(rawAmount);
  if (isNaN(amount)) return null;
  return addRelativeExpiry(from, amount, rawUnit.toLowerCase().replace(/s$/, ''));
}

/**
 * Compares a user's existing block against the block that's about to overwrite it and
 * describes every way in which the new one would be less restrictive.
 *
 * @return Human-readable descriptions of the relaxed settings, empty if nothing is relaxed
 */
export function findBlockLeniency(opts: {
  username: string;
  existing: BlockEntry;
  intended: BlockRowData;
  now?: Date;
}): string[] {
  const { username, existing, intended, now = new Date() } = opts;
  const reasons: string[] = [];

  const existingEnd = expiryToTimestamp(existing.duration, now);
  const intendedEnd = expiryToTimestamp(intended.duration, now);
  if (existingEnd !== null && intendedEnd !== null && intendedEnd < existingEnd) {
    reasons.push('it expires sooner');
  }
  if (existing.acb && !intended.acb) {
    reasons.push('account creation is re-enabled');
  }
  // AB/AO means opposite things depending on the target: for an account it's autoblock
  // (on is stricter), for an IP it's anon-only (on leaves logged-in users unaffected)
  if (mw.util.isIPAddress(username, true)) {
    if (!existing.abao && intended.abao) {
      reasons.push('it becomes anon-only');
    }
  }
  else if (existing.abao && !intended.abao) {
    reasons.push('autoblock is disabled');
  }
  if (existing.ntp && !intended.ntp) {
    reasons.push('talk page access is restored');
  }
  if (existing.nem && !intended.nem) {
    reasons.push('email access is restored');
  }

  return reasons;
}
