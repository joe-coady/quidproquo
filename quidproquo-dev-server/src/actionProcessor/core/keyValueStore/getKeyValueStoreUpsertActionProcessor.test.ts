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
import { getKeyValueStoreUpsertActionProcessor } from './getKeyValueStoreUpsertActionProcessor';

const { repo } = vi.hoisted(() => ({
  repo: { get: vi.fn(), delete: vi.fn(), query: vi.fn(), scan: vi.fn(), update: vi.fn(), upsert: vi.fn() },
}));

vi.mock('../../../logic/keyValueStore/SqliteKvsRepository', () => ({
  SqliteKvsRepository: vi.fn(() => repo),
}));

const devServerConfig = { runtimePath: '/tmp/runtime' } as any;

const getProcessor = async () => {
  const processors = await getKeyValueStoreUpsertActionProcessor(devServerConfig)(buildTestQpqConfig(), noopDynamicModuleLoader);
  return processors[KeyValueStoreActionType.Upsert];
};

describe('getKeyValueStoreUpsertActionProcessor', () => {
  beforeEach(() => vi.clearAllMocks());

  it('passes the item to the repository', async () => {
    repo.upsert.mockResolvedValue({ id: 'a' });
    const process = await getProcessor();

    const result = await invokeProcessor(process, { keyValueStoreName: 'store', item: { id: 'a' } });

    expect(repo.upsert).toHaveBeenCalledWith('store', { id: 'a' }, { ifNotExists: undefined });
    expect(resolveActionResult(result)).toEqual({ id: 'a' });
  });

  it('maps a not found error to ResourceNotFound', async () => {
    repo.upsert.mockRejectedValue(new Error('store not found'));
    const process = await getProcessor();

    const result = await invokeProcessor(process, { keyValueStoreName: 'store', item: {} });

    expect(resolveActionResultError(result).errorType).toBe('ResourceNotFound');
  });

  it('maps a generic error to a caught error', async () => {
    repo.upsert.mockRejectedValue(new Error('boom'));
    const process = await getProcessor();

    const result = await invokeProcessor(process, { keyValueStoreName: 'store', item: {} });

    expect(isErroredActionResult(result)).toBe(true);
    expect(resolveActionResultError(result).errorType).toBe(ErrorTypeEnum.GenericError);
  });
});
