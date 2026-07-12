import { QpqPagedData } from '../../types';
import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { KeyValueStoreActionType } from './KeyValueStoreActionType';
import { KvsQueryOperation } from './types';

// Options Type
export interface KeyValueStoreScanOptions {
  ttlInSeconds?: number; // Time-to-live in seconds
  limit?: number; // Maximum number of items to return
  // Enforced by the processor as a partition-key prefix filter; requires a string-typed partition key.
  scope?: string;
}

// Payload
export interface KeyValueStoreScanActionPayload {
  keyValueStoreName: string;

  filterCondition?: KvsQueryOperation;

  nextPageKey?: string;

  options?: KeyValueStoreScanOptions;
}

// Action
export interface KeyValueStoreScanAction extends Action<KeyValueStoreScanActionPayload> {
  type: KeyValueStoreActionType.Scan;
  payload: KeyValueStoreScanActionPayload;
}

// Function Types
export type KeyValueStoreScanActionProcessor<KvsItem> = ActionProcessor<KeyValueStoreScanAction, QpqPagedData<KvsItem>>;
export type KeyValueStoreScanActionRequester<KvsItem> = ActionRequester<KeyValueStoreScanAction, QpqPagedData<KvsItem>>;
