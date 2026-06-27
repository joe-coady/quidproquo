import type { HTTPMethod, NetworkRequestActionPayload } from 'quidproquo-core';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { preformNetworkRequest } from './preformNetworkRequest';

const axiosInstance = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
  head: vi.fn(),
  options: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
}));

vi.mock('axios', () => ({
  default: { create: () => axiosInstance },
}));

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

const okResponse = {
  headers: { 'content-type': 'application/json' },
  status: 200,
  statusText: 'OK',
  data: { ok: true },
};

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('preformNetworkRequest', () => {
  it('maps a successful response into an HTTPNetworkResponse', async () => {
    axiosInstance.get.mockResolvedValue(okResponse);

    const result = await preformNetworkRequest(buildPayload());

    expect(result).toEqual({
      headers: { 'content-type': 'application/json' },
      status: 200,
      statusText: 'OK',
      data: { ok: true },
    });
  });

  it('passes url, baseURL, headers, params and a json response type through to axios', async () => {
    axiosInstance.get.mockResolvedValue(okResponse);

    await preformNetworkRequest(buildPayload());

    expect(axiosInstance.get).toHaveBeenCalledWith('/resource', {
      baseURL: 'https://api.example.com',
      headers: { authorization: 'token' },
      params: { page: '1' },
      responseType: 'json',
    });
  });

  it.each([
    ['POST', 'post'],
    ['PUT', 'put'],
    ['PATCH', 'patch'],
  ] as const)('sends the body for %s requests', async (method: HTTPMethod, fn: 'post' | 'put' | 'patch') => {
    axiosInstance[fn].mockResolvedValue(okResponse);

    await preformNetworkRequest(buildPayload({ method, body: { name: 'a' } }));

    expect(axiosInstance[fn]).toHaveBeenCalledWith('/resource', { name: 'a' }, expect.any(Object));
  });

  it.each([
    ['DELETE', 'delete'],
    ['HEAD', 'head'],
    ['OPTIONS', 'options'],
  ] as const)('dispatches %s through the matching axios method', async (method: HTTPMethod, fn: 'delete' | 'head' | 'options') => {
    axiosInstance[fn].mockResolvedValue(okResponse);

    await preformNetworkRequest(buildPayload({ method }));

    expect(axiosInstance[fn]).toHaveBeenCalledTimes(1);
  });

  it('decodes a binary response and derives the filename from content-disposition', async () => {
    axiosInstance.get.mockResolvedValue({
      headers: {
        'content-type': 'application/pdf',
        'content-disposition': 'attachment; filename="report.pdf"',
      },
      status: 200,
      statusText: 'OK',
      data: Buffer.from('hello'),
    });

    const result = await preformNetworkRequest(buildPayload({ responseType: 'binary' }));

    expect(axiosInstance.get).toHaveBeenCalledWith('/resource', expect.objectContaining({ responseType: 'arraybuffer' }));
    expect(result.data).toEqual({
      base64Data: Buffer.from('hello').toString('base64'),
      mimetype: 'application/pdf',
      filename: 'report.pdf',
    });
  });

  it('falls back to a derived filename when content-disposition is absent', async () => {
    axiosInstance.get.mockResolvedValue({
      headers: { 'content-type': 'image/png' },
      status: 200,
      statusText: 'OK',
      data: Buffer.from('img'),
    });

    const result = await preformNetworkRequest(buildPayload({ responseType: 'binary' }));

    expect((result.data as { filename: string }).filename).toBe('file.png');
    expect((result.data as { mimetype: string }).mimetype).toBe('image/png');
  });

  it('returns a 500 response when the request rejects', async () => {
    axiosInstance.get.mockRejectedValue(new Error('boom'));

    const result = await preformNetworkRequest(buildPayload());

    expect(result.status).toBe(500);
    expect(result.statusText).toBe('Internal Server Error');
    expect(result.headers).toEqual({});
  });

  it('returns a 500 response for a method whose processor is not implemented', async () => {
    const result = await preformNetworkRequest(buildPayload({ method: 'CONNECT' }));

    expect(result.status).toBe(500);
  });

  it('throws when the method is not in the request map', async () => {
    await expect(preformNetworkRequest(buildPayload({ method: 'TRACE' as HTTPMethod }))).rejects.toThrow();
  });
});
