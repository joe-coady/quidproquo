import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RuntimeTypes } from '../constants';
import { SearchParams } from '../types';
import { searchLogs } from './searchLogs';

const getLogs = vi.fn();

vi.mock('./getLogs', () => ({
  getLogs: (...args: unknown[]) => getLogs(...args),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

const buildParams = (overrides: Partial<SearchParams> = {}): SearchParams =>
  ({
    runtimeType: 'EXECUTE_STORY',
    startIsoDateTime: '2026-01-01',
    endIsoDateTime: '2026-01-02',
    serviceFilter: '',
    infoFilter: '',
    errorFilter: '',
    userFilter: '',
    deep: '',
    onlyErrors: false,
    ...overrides,
  }) as SearchParams;

describe('searchLogs', () => {
  it('returns logs sorted by startedAt descending', async () => {
    getLogs.mockResolvedValue([{ startedAt: '2026-01-01T00:00:00Z' }, { startedAt: '2026-01-03T00:00:00Z' }, { startedAt: '2026-01-02T00:00:00Z' }]);

    const result = await searchLogs(buildParams(), 'https://api', 'token');

    expect(result.map((l) => l.startedAt)).toEqual(['2026-01-03T00:00:00Z', '2026-01-02T00:00:00Z', '2026-01-01T00:00:00Z']);
  });

  it('reports progress from 0 to 100', async () => {
    getLogs.mockResolvedValue([]);
    const onProgress = vi.fn();

    await searchLogs(buildParams(), 'https://api', 'token', onProgress);

    expect(onProgress).toHaveBeenCalledWith(0);
    expect(onProgress).toHaveBeenLastCalledWith(100);
  });

  it('expands ALL into every runtime type', async () => {
    getLogs.mockResolvedValue([]);

    await searchLogs(buildParams({ runtimeType: 'ALL' }), 'https://api', 'token');

    expect(getLogs).toHaveBeenCalledTimes(RuntimeTypes.length - 1);
  });
});
