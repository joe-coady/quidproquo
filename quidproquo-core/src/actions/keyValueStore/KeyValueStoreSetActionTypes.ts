import { KeyValueStoreActionType } from './KeyValueStoreActionType';
import { Action, ActionProcessor, ActionRequester } from '../../types/Action';

// Options Type
export interface KeyValueStoreSetOptions {
  ttl?: number; // Time-to-live in seconds
  // Add more options here as needed
}

// Payload
export interface KeyValueStoreSetActionPayload<Value> {
  keyValueStoreName: string;
  key: string;
  value: Value;
  options?: KeyValueStoreSetOptions;
}

// Action
export interface KeyValueStoreSetAction<Value>
  extends Action<KeyValueStoreSetActionPayload<Value>> {
  type: KeyValueStoreActionType.Set;
  payload: KeyValueStoreSetActionPayload<Value>;
}

// Function Types
export type KeyValueStoreSetActionProcessor<Value> = ActionProcessor<
  KeyValueStoreSetAction<Value>,
  void
>;
export type KeyValueStoreSetActionRequester<Value> = ActionRequester<
  KeyValueStoreSetAction<Value>,
  void
>;
