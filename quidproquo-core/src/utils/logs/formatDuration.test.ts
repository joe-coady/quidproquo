import { describe, expect, it } from 'vitest';

import { formatDuration } from './formatDuration';

describe('formatDuration', () => {
  it('formats sub-minute durations as seconds only', () => {
    expect(formatDuration(5000)).toBe('5s');
  });

  it('returns 0s for a zero duration', () => {
    expect(formatDuration(0)).toBe('0s');
  });

  it('includes a minutes part once past a minute', () => {
    expect(formatDuration(90000)).toBe('1m 30s');
  });

  it('rounds the seconds part', () => {
    expect(formatDuration(1500)).toBe('2s');
  });
});
