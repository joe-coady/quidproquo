import { buildTestQpqConfig, ErrorTypeEnum, NetworkActionType, resolveActionResult, resolveActionResultError } from 'quidproquo-core';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getNetworkRequestActionProcessor } from './getNetworkRequestActionProcessor';

const { executeNetworkRequest } = vi.hoisted(() => ({ executeNetworkRequest: vi.fn() }));

vi.mock('quidproquo-webserver', () => ({ executeNetworkRequest }));

describe('getNetworkRequestActionProcessor', () => {
  const resolve = async () => (await getNetworkRequestActionProcessor(buildTestQpqConfig(), async () => null))[NetworkActionType.Request] as (p: any, ...rest: any[]) => Promise<any>;

  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    executeNetworkRequest.mockReset();
  });

  it('wraps the network response in a successful action result', async () => {
    const response = { headers: { 'content-type': 'application/json' }, status: 200, statusText: 'OK', data: { hello: 'world' } };
    executeNetworkRequest.mockResolvedValue(response);
    const processor = await resolve();

    const result = await processor({ method: 'GET', url: '/users', responseType: 'json' });

    expect(executeNetworkRequest).toHaveBeenCalledWith({ method: 'GET', url: '/users', responseType: 'json' });
    expect(resolveActionResult(result)).toEqual(response);
  });

  it('maps a rejected request to a generic error carrying the stack', async () => {
    const error = new Error('network down');
    executeNetworkRequest.mockRejectedValue(error);
    const processor = await resolve();

    const result = await processor({ method: 'GET', url: '/x', responseType: 'json' });

    expect(resolveActionResultError(result)).toEqual({ errorType: ErrorTypeEnum.GenericError, errorText: error.stack, errorStack: undefined });
  });
});
