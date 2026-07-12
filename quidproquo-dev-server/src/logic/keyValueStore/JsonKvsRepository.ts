import { KeyValueStoreQPQConfigSetting, KvsQueryOperation, KvsUpdate, QPQConfig, qpqCoreUtils, QpqPagedData } from 'quidproquo-core';

import * as fs from 'fs';
import * as path from 'path';

import { applyUpdateToItem } from './applyKvsUpdates';
import { evaluateKvsQueryOperation, validateKvsQueryOperation } from './evaluateKvsQueryOperation';
import { KvsRepository } from './KvsRepository';
import { compareKvsItemKeys, getPk, getSk, paginateKvsItems } from './paginateKvsItems';

interface KvsStoreState {
  keyValueStoreName: string;
  scope?: string;
  items: Map<string, any>;
  dirty: boolean;
  flushTimer: NodeJS.Timeout | null;
  // Resolves once the currently-running write (and any write it coalesced in
  // while running) has finished; null when no flush is in flight.
  flushPromise: Promise<void> | null;
  // Set when a mutation lands while a flush is already running for this store,
  // so that flush re-runs once more after the current write completes.
  flushAgain: boolean;
}

const FLUSH_DEBOUNCE_MS = 100;

interface KvsStoreFile {
  items: any[];
}

// In-memory KVS repository backed by one JSON file per store on disk, replacing
// SqliteKvsRepository. Single Node process assumption: this class holds the
// sole in-process copy of every store's data (see getKvsRepository.ts, which
// guarantees one instance per service), and relies on that - there is no
// cross-process locking the way sqlite's WAL mode provided.
//
// A scope (tenant) partitions a store into its own file under a scope folder
// (`kvs/<service>/<scope>/<store>.json`), keeping the on-disk runtime state
// human-readable per tenant. The scope is validated by the action processors
// before it reaches here (it becomes a folder name).
export class JsonKvsRepository implements KvsRepository {
  private stores = new Map<string, KvsStoreState>();

  constructor(
    private runtimePath: string,
    private qpqConfig: QPQConfig,
  ) {}

  private getStoreConfig(keyValueStoreName: string): KeyValueStoreQPQConfigSetting {
    const storeConfig = qpqCoreUtils.getKeyValueStoreByName(this.qpqConfig, keyValueStoreName);
    if (!storeConfig) {
      throw new Error(`Key value store '${keyValueStoreName}' not found in configuration`);
    }
    return storeConfig;
  }

  private getStoreFilePath(keyValueStoreName: string, storeConfig: KeyValueStoreQPQConfigSetting, scope?: string): string {
    const serviceName = storeConfig.owner?.module ?? qpqCoreUtils.getApplicationModuleName(this.qpqConfig);
    return scope
      ? path.join(this.runtimePath, 'kvs', serviceName, scope, `${keyValueStoreName}.json`)
      : path.join(this.runtimePath, 'kvs', serviceName, `${keyValueStoreName}.json`);
  }

  private buildStorageKey(item: any, storeConfig: KeyValueStoreQPQConfigSetting): string {
    const pk = getPk(item, storeConfig);
    const sk = getSk(item, storeConfig);
    return sk === null ? String(pk) : `${pk}#${sk}`;
  }

  private parseStoreFile(raw: string, filePath: string): KvsStoreFile {
    try {
      return JSON.parse(raw);
    } catch (error: any) {
      throw new Error(`Invalid JSON in KVS store file '${filePath}': ${error.message}`);
    }
  }

  private getStore(keyValueStoreName: string, storeConfig: KeyValueStoreQPQConfigSetting, scope?: string): KvsStoreState {
    // Scope can never contain '/' (validated upstream), so this key is unambiguous.
    const stateKey = scope ? `${scope}/${keyValueStoreName}` : keyValueStoreName;

    const existing = this.stores.get(stateKey);
    if (existing) {
      return existing;
    }

    const filePath = this.getStoreFilePath(keyValueStoreName, storeConfig, scope);
    const items = new Map<string, any>();

    if (fs.existsSync(filePath)) {
      const parsed = this.parseStoreFile(fs.readFileSync(filePath, 'utf-8'), filePath);
      for (const item of parsed.items) {
        items.set(this.buildStorageKey(item, storeConfig), item);
      }
    }

    const state: KvsStoreState = {
      keyValueStoreName,
      scope,
      items,
      dirty: false,
      flushTimer: null,
      flushPromise: null,
      flushAgain: false,
    };
    this.stores.set(stateKey, state);
    return state;
  }

  private async writeStoreFile(state: KvsStoreState, storeConfig: KeyValueStoreQPQConfigSetting): Promise<void> {
    const filePath = this.getStoreFilePath(state.keyValueStoreName, storeConfig, state.scope);
    const dir = path.dirname(filePath);
    await fs.promises.mkdir(dir, { recursive: true });

    const items = [...state.items.values()].sort((a, b) =>
      compareKvsItemKeys(getPk(a, storeConfig), getSk(a, storeConfig), getPk(b, storeConfig), getSk(b, storeConfig)),
    );

    const tmpPath = `${filePath}.tmp`;
    await fs.promises.writeFile(tmpPath, JSON.stringify({ items } as KvsStoreFile, null, 2));
    await fs.promises.rename(tmpPath, filePath);
  }

  // Debounced, coalesced, strictly-serial-per-store flush: a burst of mutations
  // within FLUSH_DEBOUNCE_MS collapses into one write; a mutation that lands
  // while a write is already in flight is folded into the next write instead
  // of starting a second concurrent one.
  private runFlush(state: KvsStoreState, storeConfig: KeyValueStoreQPQConfigSetting): Promise<void> {
    if (state.flushPromise) {
      state.flushAgain = true;
      return state.flushPromise;
    }

    if (!state.dirty) {
      return Promise.resolve();
    }

    state.dirty = false;
    state.flushPromise = this.writeStoreFile(state, storeConfig).then(async () => {
      state.flushPromise = null;
      if (state.flushAgain) {
        state.flushAgain = false;
        await this.runFlush(state, storeConfig);
      }
    });

    return state.flushPromise;
  }

  private scheduleFlush(state: KvsStoreState, storeConfig: KeyValueStoreQPQConfigSetting): void {
    state.dirty = true;

    if (state.flushTimer) {
      return;
    }

    state.flushTimer = setTimeout(() => {
      state.flushTimer = null;
      void this.runFlush(state, storeConfig);
    }, FLUSH_DEBOUNCE_MS);
    state.flushTimer.unref();
  }

  async get(keyValueStoreName: string, key: string, scope?: string): Promise<any | null> {
    const storeConfig = this.getStoreConfig(keyValueStoreName);
    const state = this.getStore(keyValueStoreName, storeConfig, scope);
    return state.items.get(key) ?? null;
  }

  async query(
    keyValueStoreName: string,
    keyCondition: KvsQueryOperation,
    filter?: KvsQueryOperation,
    nextPageKey?: string,
    _indexName?: string,
    limit?: number,
    sortAscending: boolean = true,
    scope?: string,
  ): Promise<QpqPagedData<any>> {
    const storeConfig = this.getStoreConfig(keyValueStoreName);
    const state = this.getStore(keyValueStoreName, storeConfig, scope);

    validateKvsQueryOperation(keyCondition);
    if (filter) {
      validateKvsQueryOperation(filter);
    }

    const matched = [...state.items.values()].filter(
      (item) => evaluateKvsQueryOperation(item, keyCondition, storeConfig) && (!filter || evaluateKvsQueryOperation(item, filter, storeConfig)),
    );

    return paginateKvsItems(matched, storeConfig, sortAscending, nextPageKey, limit);
  }

  async scan(
    keyValueStoreName: string,
    filter?: KvsQueryOperation,
    nextPageKey?: string,
    limit?: number,
    scope?: string,
  ): Promise<QpqPagedData<any>> {
    const storeConfig = this.getStoreConfig(keyValueStoreName);
    const state = this.getStore(keyValueStoreName, storeConfig, scope);

    if (filter) {
      validateKvsQueryOperation(filter);
    }

    const matched = filter
      ? [...state.items.values()].filter((item) => evaluateKvsQueryOperation(item, filter, storeConfig))
      : [...state.items.values()];

    return paginateKvsItems(matched, storeConfig, true, nextPageKey, limit);
  }

  async upsert(keyValueStoreName: string, item: any, options?: { ifNotExists?: boolean }, scope?: string): Promise<any> {
    const storeConfig = this.getStoreConfig(keyValueStoreName);
    const state = this.getStore(keyValueStoreName, storeConfig, scope);
    const storageKey = this.buildStorageKey(item, storeConfig);

    if (options?.ifNotExists && state.items.has(storageKey)) {
      const conflictError = new Error(`KVS item already exists in '${keyValueStoreName}'`);
      conflictError.name = 'ConditionalCheckFailedException';
      throw conflictError;
    }

    state.items.set(storageKey, item);
    this.scheduleFlush(state, storeConfig);

    return item;
  }

  async update(keyValueStoreName: string, key: string, sortKey: string | undefined, updates: KvsUpdate, scope?: string): Promise<any> {
    const storeConfig = this.getStoreConfig(keyValueStoreName);
    const state = this.getStore(keyValueStoreName, storeConfig, scope);
    const hasSortKey = storeConfig.sortKeys.length > 0;

    const storageKey = hasSortKey && sortKey !== undefined ? `${key}#${sortKey}` : key;
    const existingItem = state.items.get(storageKey);

    // If item doesn't exist, create a base item with just the keys (like DynamoDB UpdateItem)
    const currentItem = existingItem ?? {
      [storeConfig.partitionKey.key]: key,
      ...(hasSortKey && sortKey !== undefined ? { [storeConfig.sortKeys[0].key]: sortKey } : {}),
    };

    const updatedItem = applyUpdateToItem(currentItem, updates);

    state.items.set(storageKey, updatedItem);
    this.scheduleFlush(state, storeConfig);

    return updatedItem;
  }

  async delete(keyValueStoreName: string, key: string, scope?: string): Promise<boolean> {
    const storeConfig = this.getStoreConfig(keyValueStoreName);
    const state = this.getStore(keyValueStoreName, storeConfig, scope);

    if (!state.items.has(key)) {
      return false;
    }

    state.items.delete(key);
    this.scheduleFlush(state, storeConfig);

    return true;
  }

  // Forces every store with a pending or in-flight write to flush immediately.
  async flush(): Promise<void> {
    await Promise.all(
      [...this.stores.values()].map((state) => {
        if (state.flushTimer) {
          clearTimeout(state.flushTimer);
          state.flushTimer = null;
        }
        const storeConfig = this.getStoreConfig(state.keyValueStoreName);
        return this.runFlush(state, storeConfig);
      }),
    );
  }

  async close(): Promise<void> {
    await this.flush();
  }
}
