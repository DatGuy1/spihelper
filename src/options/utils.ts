import { spiHelperParseWikitext } from '../api.ts';
import type { AbsoluteExpiry, Expiry, NoExpiry, RelativeExpiry } from '../types/api.ts';

/**
 * Returns true if the date provided is a valid date for strtotime in PHP,
 * determined by using the time parser function and a parse API call
 */
export async function spiHelperValidateDate(dateInStringFormat: string) {
  // Is this really the best way to do this? It's pretty funny
  const response = await spiHelperParseWikitext('{{#time:r|' + dateInStringFormat + '}}');
  return !response.includes('Error: Invalid time.');
}

export function isAbsoluteExpiry(value: string): value is AbsoluteExpiry {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value);
}

export function isNoExpiry(value: string): value is NoExpiry {
  return (
    value === 'infinite'
    || value === 'indefinite'
    || value === 'infinity'
    || value === 'never'
  );
}

const RELATIVE_UNITS = [
  'second', 'seconds',
  'minute', 'minutes',
  'hour', 'hours',
  'day', 'days',
  'week', 'weeks',
  'month', 'months',
  'year', 'years',
];

const RELATIVE_REGEX = new RegExp(
  `^(\\d+(?:\\.\\d+)?)\\s+(${RELATIVE_UNITS.join('|')})$`, 'i',
);

export function isRelativeExpiry(value: string): value is RelativeExpiry {
  return RELATIVE_REGEX.test(value);
}

export function parseExpiry(value: string): Expiry | null {
  if (isNoExpiry(value)) return value;
  if (isAbsoluteExpiry(value)) return value as AbsoluteExpiry;
  if (isRelativeExpiry(value)) return value as RelativeExpiry;
  return null;
}
