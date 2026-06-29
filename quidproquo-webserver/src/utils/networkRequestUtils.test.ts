import type { HTTPMethod, NetworkRequestActionPayload } from 'quidproquo-core';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { executeNetworkRequest } from './networkRequestUtils';

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

const okResponse = (overrides: Record<string, any> = {}) => ({
  headers: { 'content-type': 'application/json' },
  status: 200,
  statusText: 'OK',
  data: { hello: 'world' },
  ...overrides,
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('executeNetworkRequest', () => {
  it('issues a GET with the resolved request config and returns the response fields', async () => {
    axiosInstance.get.mockResolvedValue(okResponse());

    const result = await executeNetworkRequest(buildPayload());

    expect(axiosInstance.get).toHaveBeenCalledWith('/resource', {
      baseURL: 'https://api.example.com',
      headers: { authorization: 'token' },
      params: { page: '1' },
      responseType: 'json',
    });
    expect(result).toEqual({
      headers: { 'content-type': 'application/json' },
      status: 200,
      statusText: 'OK',
      data: { hello: 'world' },
    });
  });

  it('normalizes header values to a plain string record', async () => {
    axiosInstance.get.mockResolvedValue(okResponse({ headers: { 'content-type': 'application/json', 'content-length': 42 } }));

    const result = await executeNetworkRequest(buildPayload());

    expect(result.headers).toEqual({ 'content-type': 'application/json', 'content-length': '42' });
  });

  it.each([
    ['POST', 'post'],
    ['PUT', 'put'],
    ['PATCH', 'patch'],
  ] as const)('forwards the body for a %s request', async (method: HTTPMethod, fn: 'post' | 'put' | 'patch') => {
    axiosInstance[fn].mockResolvedValue(okResponse());

    await executeNetworkRequest(buildPayload({ method, body: { name: 'bob' } }));

    expect(axiosInstance[fn]).toHaveBeenCalledWith('/resource', { name: 'bob' }, expect.objectContaining({ responseType: 'json' }));
  });

  it.each([
    ['DELETE', 'delete'],
    ['HEAD', 'head'],
    ['OPTIONS', 'options'],
  ] as const)('issues a bodyless %s request', async (method: HTTPMethod, fn: 'delete' | 'head' | 'options') => {
    axiosInstance[fn].mockResolvedValue(okResponse());

    const result = await executeNetworkRequest(buildPayload({ method }));

    expect(axiosInstance[fn]).toHaveBeenCalledWith('/resource', expect.objectContaining({ responseType: 'json' }));
    expect(result.status).toBe(200);
  });

  it.each([
    ['binary', 'arraybuffer'],
    ['text', 'text'],
    ['json', 'json'],
  ] as const)('maps the %s response type to the %s axios response type', async (responseType: string, axiosResponseType: string) => {
    axiosInstance.get.mockResolvedValue(okResponse({ data: Buffer.from('hello'), headers: { 'content-type': 'image/png' } }));

    await executeNetworkRequest(buildPayload({ responseType: responseType as any }));

    expect(axiosInstance.get).toHaveBeenCalledWith('/resource', expect.objectContaining({ responseType: axiosResponseType }));
  });

  it('decodes a binary response and derives the filename from content-disposition', async () => {
    axiosInstance.get.mockResolvedValue(
      okResponse({
        data: Buffer.from('hello'),
        headers: { 'content-type': 'image/png', 'content-disposition': 'attachment; filename="pic.png"' },
      }),
    );

    const result = await executeNetworkRequest(buildPayload({ responseType: 'binary' }));

    expect(result.data).toEqual({
      base64Data: Buffer.from('hello').toString('base64'),
      mimetype: 'image/png',
      filename: 'pic.png',
    });
  });

  it('defaults the mimetype and filename for a binary response without headers', async () => {
    axiosInstance.get.mockResolvedValue(okResponse({ data: Buffer.from('hello'), headers: {} }));

    const result = await executeNetworkRequest(buildPayload({ responseType: 'binary' }));
    const data = result.data as { mimetype: string; filename: string };

    expect(data.mimetype).toBe('application/octet-stream');
    expect(data.filename.startsWith('file.')).toBe(true);
  });

  it('throws for an unsupported method', async () => {
    await expect(executeNetworkRequest(buildPayload({ method: 'TRACE' as HTTPMethod }))).rejects.toThrow();
  });

  it('throws for a CONNECT request', async () => {
    await expect(executeNetworkRequest(buildPayload({ method: 'CONNECT' }))).rejects.toThrow();
  });
});
