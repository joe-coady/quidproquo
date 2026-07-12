import { KvsQueryOperation, KvsUpdate, QpqPagedData } from 'quidproquo-core';

// Public surface shared by every KVS storage engine (sqlite, json, ...) so the
// action processors and the contract test suite can depend on the interface
// instead of a concrete implementation.
//
// `scope` partitions a store per tenant: each scope gets its own on-disk file
// (`kvs/<service>/<scope>/<store>.json`), so scoped data is isolated by the
// file boundary and stays human-readable - no composed key values. Undefined
// means the unscoped (Personal) partition.
export interface KvsRepository {
  get(keyValueStoreName: string, key: string, scope?: string): Promise<any | null>;

  query(
    keyValueStoreName: string,
    keyCondition: KvsQueryOperation,
    filter?: KvsQueryOperation,
    nextPageKey?: string,
    indexName?: string,
    limit?: number,
    sortAscending?: boolean,
    scope?: string,
  ): Promise<QpqPagedData<any>>;

  scan(keyValueStoreName: string, filter?: KvsQueryOperation, nextPageKey?: string, limit?: number, scope?: string): Promise<QpqPagedData<any>>;

  upsert(keyValueStoreName: string, item: any, options?: { ifNotExists?: boolean }, scope?: string): Promise<any>;

  update(keyValueStoreName: string, key: string, sortKey: string | undefined, updates: KvsUpdate, scope?: string): Promise<any>;

  delete(keyValueStoreName: string, key: string, scope?: string): Promise<boolean>;

  close(): Promise<void>;
}
