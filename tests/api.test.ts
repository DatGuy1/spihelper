import { describe, expect, test } from 'bun:test';
import { chunkArray } from '../src/api.ts';

describe('chunkArray', () => {
  test('splits into equal chunks', () => {
    expect(chunkArray([1, 2, 3, 4], 2)).toEqual([[1, 2], [3, 4]]);
  });

  test('last chunk is smaller when length is not divisible by size', () => {
    expect(chunkArray([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  test('returns empty array for empty input', () => {
    expect(chunkArray([], 5)).toEqual([]);
  });

  test('returns one chunk when size exceeds array length', () => {
    expect(chunkArray([1, 2, 3], 10)).toEqual([[1, 2, 3]]);
  });

  test('returns single-element chunks when size is 1', () => {
    expect(chunkArray(['a', 'b', 'c'], 1)).toEqual([['a'], ['b'], ['c']]);
  });

  test('preserves element order within and across chunks', () => {
    const input = [10, 20, 30, 40, 50, 60];
    const result = chunkArray(input, 3);
    expect(result).toEqual([[10, 20, 30], [40, 50, 60]]);
  });
});
