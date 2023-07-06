import { KeyValueStoreActionType } from './KeyValueStoreActionType';
import { Action, ActionProcessor, ActionRequester } from '../../types/Action';

import { KvsQueryOperation } from './types';

import { ResourceName } from '../../types';

// Options Type
export interface KeyValueStoreScanOptions {
  ttlInSeconds?: number; // Time-to-live in seconds
}

// Payload
export interface KeyValueStoreScanActionPayload {
  keyValueStoreName: ResourceName;

  filterCondition?: KvsQueryOperation;
}

// Action
export interface KeyValueStoreScanAction extends Action<KeyValueStoreScanActionPayload> {
  type: KeyValueStoreActionType.Scan;
  payload: KeyValueStoreScanActionPayload;
}

// Function Types
export type KeyValueStoreScanActionProcessor<KvsItem> = ActionProcessor<
  KeyValueStoreScanAction,
  KvsItem[]
>;
export type KeyValueStoreScanActionRequester<KvsItem> = ActionRequester<
  KeyValueStoreScanAction,
  KvsItem[]
>;
