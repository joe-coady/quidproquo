import { buildTestQpqConfig, ErrorTypeEnum, NetworkActionType, resolveActionResult, resolveActionResultError } from 'quidproquo-core';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getNetworkRequestActionProcessor } from './getNetworkRequestActionProcessor';

const { axiosInstance } = vi.hoisted(() => ({
  axiosInstance: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    head: vi.fn(),
    options: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
  },
}));

vi.mock('axios', () => ({
  default: { create: () => axiosInstance },
}));

const okResponse = (overrides: Record<string, any> = {}) => ({
  headers: { 'content-type': 'application/json' },
  status: 200,
  statusText: 'OK',
  data: { hello: 'world' },
  ...overrides,
});

describe('getNetworkRequestActionProcessor', () => {
  const resolve = async () => (await getNetworkRequestActionProcessor(buildTestQpqConfig(), async () => null))[NetworkActionType.Request] as (p: any, ...rest: any[]) => Promise<any>;

  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.values(axiosInstance).forEach((fn: any) => fn.mockReset());
  });

  it('issues a GET with the resolved request config and returns the response fields', async () => {
    axiosInstance.get.mockResolvedValue(okResponse());
    const processor = await resolve();

    const result = await processor({ method: 'GET', url: '/users', basePath: 'https://api.test', headers: { a: '1' }, params: { p: '2' }, responseType: 'json' });

    expect(axiosInstance.get).toHaveBeenCalledWith('/users', {
      baseURL: 'https://api.test',
      headers: { a: '1' },
      params: { p: '2' },
      responseType: 'json',
    });
    expect(resolveActionResult(result)).toEqual({
      headers: { 'content-type': 'application/json' },
      status: 200,
      statusText: 'OK',
      data: { hello: 'world' },
    });
  });

  it.each([
    ['POST', 'post'],
    ['PUT', 'put'],
    ['PATCH', 'patch'],
  ] as const)('forwards the body for a %s request', async (method: string, fnName: string) => {
    (axiosInstance as any)[fnName].mockResolvedValue(okResponse());
    const processor = await resolve();

    await processor({ method, url: '/users', body: { name: 'bob' }, responseType: 'json' } as any);

    expect((axiosInstance as any)[fnName]).toHaveBeenCalledWith('/users', { name: 'bob' }, expect.objectContaining({ responseType: 'json' }));
  });

  it.each([
    ['DELETE', 'delete'],
    ['HEAD', 'head'],
    ['OPTIONS', 'options'],
  ] as const)('issues a bodyless %s request', async (method: string, fnName: string) => {
    (axiosInstance as any)[fnName].mockResolvedValue(okResponse());
    const processor = await resolve();

    const result = await processor({ method, url: '/users', responseType: 'json' } as any);

    expect((axiosInstance as any)[fnName]).toHaveBeenCalledWith('/users', expect.objectContaining({ responseType: 'json' }));
    expect((resolveActionResult(result) as { status: number; data: any }).status).toBe(200);
  });

  it.each([
    ['binary', 'arraybuffer'],
    ['text', 'text'],
    ['json', 'json'],
  ] as const)('maps the %s response type to the %s axios response type', async (responseType: string, axiosResponseType: string) => {
    axiosInstance.get.mockResolvedValue(okResponse({ data: Buffer.from('hello'), headers: { 'content-type': 'image/png' } }));
    const processor = await resolve();

    await processor({ method: 'GET', url: '/file', responseType } as any);

    expect(axiosInstance.get).toHaveBeenCalledWith('/file', expect.objectContaining({ responseType: axiosResponseType }));
  });

  it('decodes a binary response and derives the filename from content-disposition', async () => {
    axiosInstance.get.mockResolvedValue(
      okResponse({
        data: Buffer.from('hello'),
        headers: { 'content-type': 'image/png', 'content-disposition': 'attachment; filename="pic.png"' },
      }),
    );
    const processor = await resolve();

    const result = await processor({ method: 'GET', url: '/file', responseType: 'binary' } as any);

    expect((resolveActionResult(result) as { status: number; data: any }).data).toEqual({
      base64Data: Buffer.from('hello').toString('base64'),
      mimetype: 'image/png',
      filename: 'pic.png',
    });
  });

  it('defaults the mimetype and filename for a binary response without headers', async () => {
    axiosInstance.get.mockResolvedValue(okResponse({ data: Buffer.from('hello'), headers: {} }));
    const processor = await resolve();

    const result = await processor({ method: 'GET', url: '/file', responseType: 'binary' } as any);
    const data = (resolveActionResult(result) as { status: number; data: any }).data;

    expect(data.mimetype).toBe('application/octet-stream');
    expect(data.filename.startsWith('file.')).toBe(true);
  });

  it('returns NotImplemented for an unsupported method', async () => {
    const processor = await resolve();

    const result = await processor({ method: 'TRACE', url: '/x', responseType: 'json' } as any);

    expect(resolveActionResultError(result)).toMatchObject({ errorType: ErrorTypeEnum.NotImplemented, errorText: 'TRACE: Not implemented' });
  });

  it('maps a thrown CONNECT request to a generic error', async () => {
    const processor = await resolve();

    const result = await processor({ method: 'CONNECT', url: '/x', responseType: 'json' } as any);

    expect(resolveActionResultError(result).errorType).toBe(ErrorTypeEnum.GenericError);
  });

  it('maps a rejected request to a generic error carrying the stack', async () => {
    const error = new Error('network down');
    axiosInstance.get.mockRejectedValue(error);
    const processor = await resolve();

    const result = await processor({ method: 'GET', url: '/x', responseType: 'json' } as any);

    expect(resolveActionResultError(result)).toEqual({ errorType: ErrorTypeEnum.GenericError, errorText: error.stack, errorStack: undefined });
  });
});
