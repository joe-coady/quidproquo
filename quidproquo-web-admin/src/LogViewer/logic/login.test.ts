import { describe, expect, it, vi } from 'vitest';

import { login } from './login';

const apiRequestPost = vi.fn();

vi.mock('../../logic', () => ({
  apiRequestPost: (...args: unknown[]) => apiRequestPost(...args),
}));

describe('login', () => {
  it('posts the credentials to /login and returns the response', async () => {
    const response = { challenge: 'NONE' };
    apiRequestPost.mockResolvedValue(response);

    const result = await login('joe', 'secret', 'https://api');

    expect(apiRequestPost).toHaveBeenCalledWith('/login', { username: 'joe', password: 'secret' }, 'https://api');
    expect(result).toBe(response);
  });
});
