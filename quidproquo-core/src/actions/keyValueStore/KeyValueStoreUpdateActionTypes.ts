import { KeyValueStoreActionType } from './KeyValueStoreActionType';
import { Action, ActionProcessor, ActionRequester } from '../../types/Action';

// Options Type
export interface KeyValueStoreUpdateOptions {
  ttl?: number; // Time-to-live in seconds
  // Add options here as needed, for example, conditional update
}

// Payload
export interface KeyValueStoreUpdateActionPayload<Value> {
  keyValueStoreName: string;
  key: string;
  value: Partial<Value>;
  options?: KeyValueStoreUpdateOptions;
}

// Action
export interface KeyValueStoreUpdateAction<Value>
  extends Action<KeyValueStoreUpdateActionPayload<Value>> {
  type: KeyValueStoreActionType.Update;
  payload: KeyValueStoreUpdateActionPayload<Value>;
}

// Function Types
export type KeyValueStoreUpdateActionProcessor<Value> = ActionProcessor<
  KeyValueStoreUpdateAction<Value>,
  void
>;
export type KeyValueStoreUpdateActionRequester<Value> = ActionRequester<
  KeyValueStoreUpdateAction<Value>,
  void
>;
