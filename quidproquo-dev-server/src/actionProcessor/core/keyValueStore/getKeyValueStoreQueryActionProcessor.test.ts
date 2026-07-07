import {
  buildTestQpqConfig,
  ErrorTypeEnum,
  isErroredActionResult,
  KeyValueStoreActionType,
  noopDynamicModuleLoader,
  resolveActionResult,
  resolveActionResultError,
} from 'quidproquo-core';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { invokeProcessor } from '../../../testing/testProcessorRuntime';
import { getKeyValueStoreQueryActionProcessor } from './getKeyValueStoreQueryActionProcessor';

const { repo } = vi.hoisted(() => ({
  repo: { get: vi.fn(), delete: vi.fn(), query: vi.fn(), scan: vi.fn(), update: vi.fn(), upsert: vi.fn() },
}));

vi.mock('../../../logic/keyValueStore/SqliteKvsRepository', () => ({
  SqliteKvsRepository: vi.fn(() => repo),
}));

const devServerConfig = { runtimePath: '/tmp/runtime' } as any;

const getProcessor = async () => {
  const processors = await getKeyValueStoreQueryActionProcessor(devServerConfig)(buildTestQpqConfig(), noopDynamicModuleLoader);
  return processors[KeyValueStoreActionType.Query];
};

describe('getKeyValueStoreQueryActionProcessor', () => {
  beforeEach(() => vi.clearAllMocks());

  it('passes the key condition and options to the repository', async () => {
    repo.query.mockResolvedValue({ items: [] });
    const process = await getProcessor();

    const result = await invokeProcessor(process, {
      keyValueStoreName: 'store',
      keyCondition: 'id = :id',
      options: { filter: 'f', nextPageKey: 'np', limit: 10, sortAscending: false },
    });

    expect(repo.query).toHaveBeenCalledWith('store', 'id = :id', 'f', 'np', undefined, 10, false);
    expect(resolveActionResult(result)).toEqual({ items: [] });
  });

  it('defaults sortAscending to true when omitted', async () => {
    repo.query.mockResolvedValue({ items: [] });
    const process = await getProcessor();

    await invokeProcessor(process, { keyValueStoreName: 'store', keyCondition: 'id = :id' });

    expect(repo.query).toHaveBeenCalledWith('store', 'id = :id', undefined, undefined, undefined, undefined, true);
  });

  it('maps a not found error to ResourceNotFound', async () => {
    repo.query.mockRejectedValue(new Error('store not found'));
    const process = await getProcessor();

    const result = await invokeProcessor(process, { keyValueStoreName: 'store', keyCondition: 'id = :id' });

    expect(resolveActionResultError(result).errorType).toBe('ResourceNotFound');
  });

  it('maps a generic error to a caught error', async () => {
    repo.query.mockRejectedValue(new Error('boom'));
    const process = await getProcessor();

    const result = await invokeProcessor(process, { keyValueStoreName: 'store', keyCondition: 'id = :id' });

    expect(isErroredActionResult(result)).toBe(true);
    expect(resolveActionResultError(result).errorType).toBe(ErrorTypeEnum.GenericError);
  });
});
