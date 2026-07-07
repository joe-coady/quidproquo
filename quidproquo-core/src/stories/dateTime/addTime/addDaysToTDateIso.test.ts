import { describe, expect, it } from 'vitest';

import { addDaysToTDateIso } from './addDaysToTDateIso';
import { addMonthsToTDateIso } from './addMonthsToTDateIso';

describe('addDaysToTDateIso', () => {
  it('adds days and returns an ISO string', () => {
    expect(addDaysToTDateIso('2024-01-01T00:00:00.000Z', 5)).toBe('2024-01-06T00:00:00.000Z');
  });

  it('rolls over the month boundary', () => {
    expect(addDaysToTDateIso('2024-01-30T00:00:00.000Z', 3)).toBe('2024-02-02T00:00:00.000Z');
  });

  it('subtracts with a negative count', () => {
    expect(addDaysToTDateIso('2024-01-01T00:00:00.000Z', -1)).toBe('2023-12-31T00:00:00.000Z');
  });
});

describe('addMonthsToTDateIso', () => {
  it('adds months and rolls over the year', () => {
    expect(addMonthsToTDateIso('2024-11-15T00:00:00.000Z', 2)).toBe('2025-01-15T00:00:00.000Z');
  });
});
