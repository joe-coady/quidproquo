import { afterEach, describe, expect, it, vi } from 'vitest';

import { apiRequestGet, apiRequestPost, externalRequestGet } from './apiRequest';

const get = vi.fn();
const post = vi.fn();
const create = vi.fn(() => ({ get, post }));

vi.mock('axios', () => ({
  default: {
    create: (...args: unknown[]) => create(...args),
  },
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('apiRequestPost', () => {
  it('posts the body and returns the response data', async () => {
    post.mockResolvedValue({ data: { ok: true } });

    const result = await apiRequestPost('/path', { a: 1 }, 'https://api', 'token');

    expect(create).toHaveBeenCalledWith({
      baseURL: 'https://api',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token' },
    });
    expect(post).toHaveBeenCalledWith('/path', { a: 1 });
    expect(result).toEqual({ ok: true });
  });
});

describe('apiRequestGet', () => {
  it('omits the Authorization header when no token is given', async () => {
    get.mockResolvedValue({ data: ['x'] });

    const result = await apiRequestGet('/path', 'https://api');

    expect(create).toHaveBeenCalledWith({
      baseURL: 'https://api',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(result).toEqual(['x']);
  });
});

describe('externalRequestGet', () => {
  it('gets the url without a base url', async () => {
    get.mockResolvedValue({ data: { id: 1 } });

    const result = await externalRequestGet('https://external/thing');

    expect(create).toHaveBeenCalledWith({ headers: { 'Content-Type': 'application/json' } });
    expect(get).toHaveBeenCalledWith('https://external/thing');
    expect(result).toEqual({ id: 1 });
  });
});
