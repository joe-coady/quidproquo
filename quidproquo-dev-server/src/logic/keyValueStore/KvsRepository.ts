import { KvsQueryOperation, KvsUpdate, QpqPagedData } from 'quidproquo-core';

// Public surface shared by every KVS storage engine (sqlite, json, ...) so the
// action processors and the contract test suite can depend on the interface
// instead of a concrete implementation.
export interface KvsRepository {
  get(keyValueStoreName: string, key: string): Promise<any | null>;

  query(
    keyValueStoreName: string,
    keyCondition: KvsQueryOperation,
    filter?: KvsQueryOperation,
    nextPageKey?: string,
    indexName?: string,
    limit?: number,
    sortAscending?: boolean,
  ): Promise<QpqPagedData<any>>;

  scan(keyValueStoreName: string, filter?: KvsQueryOperation, nextPageKey?: string, limit?: number): Promise<QpqPagedData<any>>;

  upsert(keyValueStoreName: string, item: any, options?: { ifNotExists?: boolean }): Promise<any>;

  update(keyValueStoreName: string, key: string, sortKey: string | undefined, updates: KvsUpdate): Promise<any>;

  delete(keyValueStoreName: string, key: string): Promise<boolean>;

  close(): Promise<void>;
}
