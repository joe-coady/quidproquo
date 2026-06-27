import { describe, expect, it, vi } from 'vitest';

import { respondToAuthChallenge } from './respondToAuthChallenge';

const apiRequestPost = vi.fn();

vi.mock('../../logic', () => ({
  apiRequestPost: (...args: unknown[]) => apiRequestPost(...args),
}));

describe('respondToAuthChallenge', () => {
  it('posts the challenge payload to /challenge', async () => {
    const response = { challenge: 'NONE' };
    apiRequestPost.mockResolvedValue(response);

    const result = await respondToAuthChallenge('joe@x.com', 'sess', 'NEW_PASSWORD_REQUIRED', 'newpass', 'https://api');

    expect(apiRequestPost).toHaveBeenCalledWith(
      '/challenge',
      { email: 'joe@x.com', session: 'sess', challenge: 'NEW_PASSWORD_REQUIRED', newPassword: 'newpass' },
      'https://api',
    );
    expect(result).toBe(response);
  });
});
