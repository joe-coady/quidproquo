// @vitest-environment jsdom
import { ApiActionType } from 'quidproquo-web';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createApiRequestActionProcessor, getApiRequestActionProcessor } from './createApiRequestActionProcessor';

const preformNetworkRequest = vi.hoisted(() => vi.fn());

vi.mock('quidproquo-web', async (importOriginal: <T>() => Promise<T>) => ({
  ...(await importOriginal<typeof import('quidproquo-web')>()),
  preformNetworkRequest,
}));

const buildRequest = () => ({
  service: 'orders',
  endpoint: '/orders',
  method: 'GET' as const,
  body: undefined,
  params: { page: '1' },
  headers: { 'x-call': 'call' },
  responseType: 'json' as const,
});

const getProcessor = async (resolver = getApiRequestActionProcessor) => {
  const processors = await resolver(undefined as any, undefined as any);
  return processors[ApiActionType.Request] as (p: any, ...rest: any[]) => Promise<any>;
};

describe('createApiRequestActionProcessor', () => {
  beforeEach(() => {
    preformNetworkRequest.mockResolvedValue({ status: 200, data: 'ok' });
    window.history.replaceState(null, '', '/');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns the network response in the action result', async () => {
    const processor = await getProcessor();

    const [result] = await processor(buildRequest());

    expect(result).toEqual({ status: 200, data: 'ok' });
  });

  it('defaults the base url to api.<host> when no resolver is supplied', async () => {
    const { protocol, hostname, port } = window.location;
    const processor = await getProcessor();

    await processor(buildRequest());

    expect(preformNetworkRequest).toHaveBeenCalledWith(
      expect.objectContaining({ basePath: `${protocol}//api.${hostname}${port ? `:${port}` : ''}` }),
    );
  });

  it('uses a custom service base url resolver', async () => {
    const resolveServiceBaseUrl = vi.fn((service: string) => `https://${service}.test`);
    const processor = await getProcessor(createApiRequestActionProcessor({ resolveServiceBaseUrl }));

    await processor(buildRequest());

    expect(resolveServiceBaseUrl).toHaveBeenCalledWith('orders');
    expect(preformNetworkRequest).toHaveBeenCalledWith(expect.objectContaining({ basePath: 'https://orders.test' }));
  });

  it('merges per-call headers with the provided getHeaders, letting getHeaders win', async () => {
    const getHeaders = vi.fn(() => ({ 'x-call': 'override', authorization: 'Bearer t' }));
    const processor = await getProcessor(createApiRequestActionProcessor({ getHeaders }));

    await processor(buildRequest());

    expect(preformNetworkRequest).toHaveBeenCalledWith(
      expect.objectContaining({ headers: { 'x-call': 'override', authorization: 'Bearer t' } }),
    );
  });
});
