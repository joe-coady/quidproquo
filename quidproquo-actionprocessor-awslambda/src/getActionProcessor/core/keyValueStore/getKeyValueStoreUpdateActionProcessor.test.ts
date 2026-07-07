import { defineAwsServiceAccountInfo } from 'quidproquo-config-aws';
import { buildTestQpqConfig, defineKeyValueStore, KeyValueStoreActionType } from 'quidproquo-core';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { updateItem } from '../../../logic/dynamo';
import { invokeProcessor } from '../../../testing/processorTestHelpers';
import { getKeyValueStoreUpdateActionProcessor } from './getKeyValueStoreUpdateActionProcessor';

vi.mock('../../../logic/dynamo', () => ({
  updateItem: vi.fn(),
}));

const resolveProcessor = async () => {
  const config = buildTestQpqConfig([defineAwsServiceAccountInfo('111', 'eu-west-1'), defineKeyValueStore('users', 'pk', ['sk'])]);
  const processors = await getKeyValueStoreUpdateActionProcessor(config, {} as any);
  return processors[KeyValueStoreActionType.Update];
};

describe('getKeyValueStoreUpdateActionProcessor', () => {
  beforeEach(() => {
    vi.mocked(updateItem).mockReset();
  });

  it('updates the item using the store partition and sort keys and returns it', async () => {
    vi.mocked(updateItem).mockResolvedValue({ id: 'k1', updated: true } as any);
    const processor = await resolveProcessor();

    const updates = [{ logicalOperation: 'Set' }];
    const result = await invokeProcessor(processor, { keyValueStoreName: 'users', key: 'k1', sortKey: 's1', updates });

    expect(result).toEqual([{ id: 'k1', updated: true }]);
    expect(updateItem).toHaveBeenCalledWith('users-test-app-test-module-development-qpqkvs', 'eu-west-1', updates, 'pk', 'k1', 'sk', 's1');
  });
});
