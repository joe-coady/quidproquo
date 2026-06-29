import type { NetworkRequestActionPayload } from 'quidproquo-core';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { preformNetworkRequest } from './preformNetworkRequest';

const { executeNetworkRequest } = vi.hoisted(() => ({ executeNetworkRequest: vi.fn() }));

vi.mock('./networkRequestUtils', () => ({ executeNetworkRequest }));

const buildPayload = (overrides: Partial<NetworkRequestActionPayload<any>> = {}): NetworkRequestActionPayload<any> =>
  ({
    url: '/resource',
    basePath: 'https://api.example.com',
    method: 'GET',
    headers: { authorization: 'token' },
    params: { page: '1' },
    responseType: 'json',
    ...overrides,
  }) as NetworkRequestActionPayload<any>;

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
  executeNetworkRequest.mockReset();
});

describe('preformNetworkRequest', () => {
  it('returns the executed network response', async () => {
    const response = { headers: { 'content-type': 'application/json' }, status: 200, statusText: 'OK', data: { ok: true } };
    executeNetworkRequest.mockResolvedValue(response);

    const payload = buildPayload();
    const result = await preformNetworkRequest(payload);

    expect(executeNetworkRequest).toHaveBeenCalledWith(payload);
    expect(result).toEqual(response);
  });

  it('returns a 500 response when the request rejects', async () => {
    executeNetworkRequest.mockRejectedValue(new Error('boom'));

    const result = await preformNetworkRequest(buildPayload());

    expect(result.status).toBe(500);
    expect(result.statusText).toBe('Internal Server Error');
    expect(result.headers).toEqual({});
  });
});
