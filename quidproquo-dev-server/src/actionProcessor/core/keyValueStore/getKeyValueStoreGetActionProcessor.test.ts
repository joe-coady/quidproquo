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
import { getKeyValueStoreGetActionProcessor } from './getKeyValueStoreGetActionProcessor';

const { repo } = vi.hoisted(() => ({
  repo: { get: vi.fn(), delete: vi.fn(), query: vi.fn(), scan: vi.fn(), update: vi.fn(), upsert: vi.fn() },
}));

vi.mock('../../../logic/keyValueStore/SqliteKvsRepository', () => ({
  SqliteKvsRepository: vi.fn(() => repo),
}));

const devServerConfig = { runtimePath: '/tmp/runtime' } as any;

const getProcessor = async () => {
  const processors = await getKeyValueStoreGetActionProcessor(devServerConfig)(buildTestQpqConfig(), noopDynamicModuleLoader);
  return processors[KeyValueStoreActionType.Get];
};

describe('getKeyValueStoreGetActionProcessor', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns the value from the repository', async () => {
    repo.get.mockResolvedValue({ id: 'a' });
    const process = await getProcessor();

    const result = await invokeProcessor(process, { keyValueStoreName: 'store', key: 'a' });

    expect(repo.get).toHaveBeenCalledWith('store', 'a');
    expect(resolveActionResult(result)).toEqual({ id: 'a' });
  });

  it('maps a not found error to ResourceNotFound', async () => {
    repo.get.mockRejectedValue(new Error('Key value store store not found'));
    const process = await getProcessor();

    const result = await invokeProcessor(process, { keyValueStoreName: 'store', key: 'a' });

    expect(isErroredActionResult(result)).toBe(true);
    expect(resolveActionResultError(result).errorType).toBe('ResourceNotFound');
  });

  it('maps a generic error to a caught error', async () => {
    repo.get.mockRejectedValue(new Error('boom'));
    const process = await getProcessor();

    const result = await invokeProcessor(process, { keyValueStoreName: 'store', key: 'a' });

    expect(isErroredActionResult(result)).toBe(true);
    expect(resolveActionResultError(result).errorType).toBe(ErrorTypeEnum.GenericError);
  });
});
