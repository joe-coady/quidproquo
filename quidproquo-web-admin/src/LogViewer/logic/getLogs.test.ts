import { describe, expect, it, vi } from 'vitest';

import { getLogs } from './getLogs';

const apiRequestPost = vi.fn();

vi.mock('../../logic', () => ({
  apiRequestPost: (...args: unknown[]) => apiRequestPost(...args),
}));

const callGetLogs = () => getLogs('/log/list', 'EXECUTE_STORY', 'start', 'end', 'svc', 'info', 'err', 'user', 'true', true, 'https://api', 'token');

describe('getLogs', () => {
  it('follows the nextPageKey until exhausted and concatenates items', async () => {
    apiRequestPost
      .mockResolvedValueOnce({ items: [{ id: 1 }], nextPageKey: 'k2' })
      .mockResolvedValueOnce({ items: [{ id: 2 }], nextPageKey: undefined });

    const result = await callGetLogs();

    expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    expect(apiRequestPost).toHaveBeenCalledTimes(2);
  });

  it('sends the search span and the running page key on each request', async () => {
    apiRequestPost.mockResolvedValueOnce({ items: [], nextPageKey: undefined });

    await callGetLogs();

    expect(apiRequestPost).toHaveBeenCalledWith(
      '/log/list',
      expect.objectContaining({
        runtimeType: 'EXECUTE_STORY',
        startIsoDateTime: 'start',
        endIsoDateTime: 'end',
        serviceFilter: 'svc',
        onlyErrors: true,
        nextPageKey: undefined,
      }),
      'https://api',
      'token',
    );
  });
});
