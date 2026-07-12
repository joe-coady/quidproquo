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
import { getKeyValueStoreScanActionProcessor } from './getKeyValueStoreScanActionProcessor';

const { repo } = vi.hoisted(() => ({
  repo: { get: vi.fn(), delete: vi.fn(), query: vi.fn(), scan: vi.fn(), update: vi.fn(), upsert: vi.fn() },
}));

vi.mock('../../../logic/keyValueStore/getKvsRepository', () => ({
  getKvsRepository: vi.fn(() => repo),
}));

const devServerConfig = { runtimePath: '/tmp/runtime' } as any;

const getProcessor = async () => {
  const processors = await getKeyValueStoreScanActionProcessor(devServerConfig)(buildTestQpqConfig(), noopDynamicModuleLoader);
  return processors[KeyValueStoreActionType.Scan];
};

describe('getKeyValueStoreScanActionProcessor', () => {
  beforeEach(() => vi.clearAllMocks());

  it('passes the filter condition and next page key to the repository', async () => {
    repo.scan.mockResolvedValue({ items: [{ id: 'a' }] });
    const process = await getProcessor();

    const result = await invokeProcessor(process, { keyValueStoreName: 'store', filterCondition: 'active = true', nextPageKey: 'np' });

    expect(repo.scan).toHaveBeenCalledWith('store', 'active = true', 'np', undefined, undefined);
    expect(resolveActionResult(result)).toEqual({ items: [{ id: 'a' }] });
  });

  it('maps a not found error to ResourceNotFound', async () => {
    repo.scan.mockRejectedValue(new Error('store not found'));
    const process = await getProcessor();

    const result = await invokeProcessor(process, { keyValueStoreName: 'store' });

    expect(resolveActionResultError(result).errorType).toBe('ResourceNotFound');
  });

  it('maps a generic error to a caught error', async () => {
    repo.scan.mockRejectedValue(new Error('boom'));
    const process = await getProcessor();

    const result = await invokeProcessor(process, { keyValueStoreName: 'store' });

    expect(isErroredActionResult(result)).toBe(true);
    expect(resolveActionResultError(result).errorType).toBe(ErrorTypeEnum.GenericError);
  });
});
