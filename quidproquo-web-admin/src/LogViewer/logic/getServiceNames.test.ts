import { describe, expect, it, vi } from 'vitest';

import { getServiceNames } from './getServiceNames';

const apiRequestGet = vi.fn();

vi.mock('../../logic', () => ({
  apiRequestGet: (...args: unknown[]) => apiRequestGet(...args),
}));

describe('getServiceNames', () => {
  it('gets the admin services list', async () => {
    apiRequestGet.mockResolvedValue(['a', 'b']);

    const result = await getServiceNames('https://api', 'token');

    expect(apiRequestGet).toHaveBeenCalledWith('/admin/services', 'https://api', 'token');
    expect(result).toEqual(['a', 'b']);
  });
});
