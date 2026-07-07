import { defineAwsServiceAccountInfo } from 'quidproquo-config-aws';
import { buildTestQpqConfig, defineKeyValueStore, KeyValueStoreActionType } from 'quidproquo-core';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { scan } from '../../../logic/dynamo/scan';
import { invokeProcessor } from '../../../testing/processorTestHelpers';
import { getKeyValueStoreScanActionProcessor } from './getKeyValueStoreScanActionProcessor';

vi.mock('../../../logic/dynamo/scan', () => ({
  scan: vi.fn(),
}));

const resolveProcessor = async () => {
  const config = buildTestQpqConfig([defineAwsServiceAccountInfo('111', 'eu-west-1'), defineKeyValueStore('users', 'pk', ['sk'])]);
  const processors = await getKeyValueStoreScanActionProcessor(config, {} as any);
  return processors[KeyValueStoreActionType.Scan];
};

describe('getKeyValueStoreScanActionProcessor', () => {
  beforeEach(() => {
    vi.mocked(scan).mockReset();
  });

  it('scans the resolved dynamo table with the filter and page key', async () => {
    vi.mocked(scan).mockResolvedValue({ items: [] } as any);
    const processor = await resolveProcessor();

    const result = await invokeProcessor(processor, { keyValueStoreName: 'users', filterCondition: { f: 1 }, nextPageKey: 'pk1' });

    expect(result).toEqual([{ items: [] }]);
    expect(scan).toHaveBeenCalledWith('users-test-app-test-module-development-qpqkvs', 'eu-west-1', { f: 1 }, 'pk1');
  });
});
