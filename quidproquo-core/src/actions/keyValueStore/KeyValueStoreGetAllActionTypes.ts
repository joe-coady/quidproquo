import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { KeyValueStoreActionType } from './KeyValueStoreActionType';

// Options Type
export interface KeyValueStoreGetAllOptions {
  // Enforced by the processor as a partition-key prefix filter; requires a string-typed partition key.
  scope?: string;
}

// Payload
export interface KeyValueStoreGetAllActionPayload {
  keyValueStoreName: string;
  options?: KeyValueStoreGetAllOptions;
}

// Action
export interface KeyValueStoreGetAllAction<Value> extends Action<KeyValueStoreGetAllActionPayload> {
  type: KeyValueStoreActionType.GetAll;
  payload: KeyValueStoreGetAllActionPayload;
}

// Function Types
export type KeyValueStoreGetAllActionProcessor<Value> = ActionProcessor<KeyValueStoreGetAllAction<Value>, Value[]>;
export type KeyValueStoreGetAllActionRequester<Value> = ActionRequester<KeyValueStoreGetAllAction<Value>, Value[]>;
