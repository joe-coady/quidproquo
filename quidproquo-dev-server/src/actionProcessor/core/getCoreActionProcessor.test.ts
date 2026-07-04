import {
  buildTestQpqConfig,
  defineEventBus,
  defineKeyValueStore,
  defineQueue,
  EventBusActionType,
  KeyValueStoreActionType,
  LogActionType,
  noopDynamicModuleLoader,
  QueueActionType,
  UserDirectoryActionType,
} from 'quidproquo-core';

import { describe, expect, it, vi } from 'vitest';

import { getCoreActionProcessor } from './getCoreActionProcessor';

const { repo } = vi.hoisted(() => ({
  repo: { get: vi.fn(), delete: vi.fn(), query: vi.fn(), scan: vi.fn(), update: vi.fn(), upsert: vi.fn() },
}));

vi.mock('../../logic/keyValueStore/SqliteKvsRepository', () => ({
  SqliteKvsRepository: vi.fn(() => repo),
}));

const devServerConfig = {
  runtimePath: '/tmp/runtime',
  fileStorageConfig: {
    storagePath: '/tmp/files',
    secureUrlHost: 'localhost',
    secureUrlPort: 4000,
    secureUrlSecret: 'secret',
  },
} as any;

describe('getCoreActionProcessor', () => {
  it('aggregates processors across every core domain', async () => {
    const config = buildTestQpqConfig([defineKeyValueStore('store', 'id'), defineEventBus('myBus'), defineQueue('myQueue', {})]);

    const processors = await getCoreActionProcessor(config, noopDynamicModuleLoader, devServerConfig);

    expect(processors[KeyValueStoreActionType.Get]).toBeDefined();
    expect(processors[EventBusActionType.SendMessages]).toBeDefined();
    expect(processors[QueueActionType.SendMessages]).toBeDefined();
    expect(processors[LogActionType.Create]).toBeDefined();
    expect(processors[UserDirectoryActionType.DecodeAccessToken]).toBeDefined();
  });
});
