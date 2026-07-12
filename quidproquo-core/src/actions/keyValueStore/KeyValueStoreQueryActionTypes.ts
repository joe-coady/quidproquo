import { QpqPagedData } from '../../types';
import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { KeyValueStoreActionType } from './KeyValueStoreActionType';
import { KvsQueryOperation } from './types';

// Options Type
export interface KeyValueStoreQueryOptions {
  // Accepted but not implemented: no processor applies a TTL to query results.
  ttlInSeconds?: number;
  sortAscending?: boolean;
  limit?: number;
  nextPageKey?: string;
  filter?: KvsQueryOperation;
  // Composed into partition-key conditions by the processor; requires a string-typed partition key.
  scope?: string;
}

// Payload
export interface KeyValueStoreQueryActionPayload {
  keyValueStoreName: string;

  keyCondition: KvsQueryOperation;

  options?: KeyValueStoreQueryOptions;
}

// Action
export interface KeyValueStoreQueryAction extends Action<KeyValueStoreQueryActionPayload> {
  type: KeyValueStoreActionType.Query;
  payload: KeyValueStoreQueryActionPayload;
}

// Function Types
export type KeyValueStoreQueryActionProcessor<KvsItem> = ActionProcessor<KeyValueStoreQueryAction, QpqPagedData<KvsItem>>;
export type KeyValueStoreQueryActionRequester<KvsItem> = ActionRequester<KeyValueStoreQueryAction, QpqPagedData<KvsItem>>;
