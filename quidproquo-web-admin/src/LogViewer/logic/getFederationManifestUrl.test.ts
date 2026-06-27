import { describe, expect, it, vi } from 'vitest';

import { getFederationManifest } from './getFederationManifestUrl';

const apiRequestGet = vi.fn();

vi.mock('../../logic', () => ({
  apiRequestGet: (...args: unknown[]) => apiRequestGet(...args),
}));

describe('getFederationManifest', () => {
  it('gets the manifest json from the url', async () => {
    apiRequestGet.mockResolvedValue({ id: 'remote-1' });

    const result = await getFederationManifest('https://api', 'https://api/mf-manifest.json');

    expect(apiRequestGet).toHaveBeenCalledWith('https://api/mf-manifest.json', 'https://api');
    expect(result).toEqual({ id: 'remote-1' });
  });
});
