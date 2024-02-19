import { KeyValueStoreActionType } from './KeyValueStoreActionType';
import { Action, ActionProcessor, ActionRequester } from '../../types/Action';

import { KvsQueryOperation } from './types';

import { QpqPagedData } from '../../types';

// Options Type
export interface KeyValueStoreQueryOptions {
  ttlInSeconds?: number; // Time-to-live in seconds
  sortAscending?: boolean;
  limit?: number;
  nextPageKey?: string;
  filter?: KvsQueryOperation;
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
export type KeyValueStoreQueryActionProcessor<KvsItem> = ActionProcessor<
  KeyValueStoreQueryAction,
  QpqPagedData<KvsItem>
>;
export type KeyValueStoreQueryActionRequester<KvsItem> = ActionRequester<
  KeyValueStoreQueryAction,
  QpqPagedData<KvsItem>
>;
