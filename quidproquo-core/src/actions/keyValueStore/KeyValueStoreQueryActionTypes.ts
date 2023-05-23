import { KeyValueStoreActionType } from './KeyValueStoreActionType';
import { Action, ActionProcessor, ActionRequester } from '../../types/Action';

import { KvsQueryOperation } from './types';

// Options Type
export interface KeyValueStoreQueryOptions {
  ttlInSeconds?: number; // Time-to-live in seconds
}

// Payload
export interface KeyValueStoreQueryActionPayload {
  keyValueStoreName: string;

  operations: KvsQueryOperation[];
}

// Action
export interface KeyValueStoreQueryAction extends Action<KeyValueStoreQueryActionPayload> {
  type: KeyValueStoreActionType.Query;
  payload: KeyValueStoreQueryActionPayload;
}

// Function Types
export type KeyValueStoreQueryActionProcessor<KvsItem> = ActionProcessor<
  KeyValueStoreQueryAction,
  KvsItem[]
>;
export type KeyValueStoreQueryActionRequester<KvsItem> = ActionRequester<
  KeyValueStoreQueryAction,
  KvsItem[]
>;
