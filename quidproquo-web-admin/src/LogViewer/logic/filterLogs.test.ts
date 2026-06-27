import { describe, expect, it } from 'vitest';

import { filterLogs } from './filterLogs';

const logs = [{ error: 'Timeout while connecting' }, { error: 'Permission denied' }, { error: '' }, {}];

describe('filterLogs', () => {
  it('returns all logs when the filter is empty', () => {
    expect(filterLogs('', logs)).toBe(logs);
  });

  it('matches logs whose error contains every word case-insensitively', () => {
    expect(filterLogs('TIMEOUT connecting', logs)).toEqual([{ error: 'Timeout while connecting' }]);
  });

  it('excludes logs missing one of the words', () => {
    expect(filterLogs('permission timeout', logs)).toEqual([]);
  });

  it('excludes logs without an error message', () => {
    expect(filterLogs('denied', logs)).toEqual([{ error: 'Permission denied' }]);
  });
});
