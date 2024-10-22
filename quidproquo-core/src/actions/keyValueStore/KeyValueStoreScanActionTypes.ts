import { QpqPagedData } from '../../types';

import { KeyValueStoreActionType } from './KeyValueStoreActionType';
import { Action, ActionProcessor, ActionRequester } from '../../types/Action';

import { KvsQueryOperation } from './types';

// Options Type
export interface KeyValueStoreScanOptions {
  ttlInSeconds?: number; // Time-to-live in seconds
  limit?: number; // Maximum number of items to return
}

// Payload
export interface KeyValueStoreScanActionPayload {
  keyValueStoreName: string;

  filterCondition?: KvsQueryOperation;

  nextPageKey?: string;
}

// Action
export interface KeyValueStoreScanAction extends Action<KeyValueStoreScanActionPayload> {
  type: KeyValueStoreActionType.Scan;
  payload: KeyValueStoreScanActionPayload;
}

// Function Types
export type KeyValueStoreScanActionProcessor<KvsItem> = ActionProcessor<KeyValueStoreScanAction, QpqPagedData<KvsItem>>;
export type KeyValueStoreScanActionRequester<KvsItem> = ActionRequester<KeyValueStoreScanAction, QpqPagedData<KvsItem>>;
