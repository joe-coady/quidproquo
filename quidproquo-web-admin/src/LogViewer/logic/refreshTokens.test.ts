import { AuthenticationInfo } from 'quidproquo-core';

import { describe, expect, it, vi } from 'vitest';

import { refreshTokens } from './refreshTokens';

const apiRequestPost = vi.fn();

vi.mock('../../logic', () => ({
  apiRequestPost: (...args: unknown[]) => apiRequestPost(...args),
}));

describe('refreshTokens', () => {
  it('posts the refresh token with the access token as auth', async () => {
    const response = { challenge: 'NONE' };
    apiRequestPost.mockResolvedValue(response);
    const authInfo = { refreshToken: 'refresh', accessToken: 'access' } as AuthenticationInfo;

    const result = await refreshTokens(authInfo, 'https://api');

    expect(apiRequestPost).toHaveBeenCalledWith('/refreshToken', { refreshToken: 'refresh' }, 'https://api', 'access');
    expect(result).toBe(response);
  });

  it('tolerates a missing authentication info', async () => {
    apiRequestPost.mockResolvedValue({});

    await refreshTokens(undefined, 'https://api');

    expect(apiRequestPost).toHaveBeenCalledWith('/refreshToken', { refreshToken: undefined }, 'https://api', undefined);
  });
});
