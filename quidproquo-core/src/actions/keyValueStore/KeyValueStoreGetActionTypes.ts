import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { KeyValueStoreActionType } from './KeyValueStoreActionType';

// Options Type
export interface KeyValueStoreGetOptions {
  // Composed into the partition key value by the processor; requires a string-typed partition key.
  scope?: string;
}

// Payload
export interface KeyValueStoreGetActionPayload {
  keyValueStoreName: string;
  key: string;
  options?: KeyValueStoreGetOptions;
}

// Action
export interface KeyValueStoreGetAction<Value> extends Action<KeyValueStoreGetActionPayload> {
  type: KeyValueStoreActionType.Get;
  payload: KeyValueStoreGetActionPayload;
}

// Function Types
export type KeyValueStoreGetActionProcessor<Value> = ActionProcessor<KeyValueStoreGetAction<Value>, Value | null>;
export type KeyValueStoreGetActionRequester<Value> = ActionRequester<KeyValueStoreGetAction<Value>, Value | null>;
