import { KeyValueStoreActionType } from './KeyValueStoreActionType';
import { Action, ActionProcessor, ActionRequester } from '../../types/Action';

// Options Type
export interface KeyValueStoreGetAllOptions {
  // Add options here as needed, for example, read consistency
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
export type KeyValueStoreGetAllActionProcessor<Value> = ActionProcessor<
  KeyValueStoreGetAllAction<Value>,
  Value[]
>;
export type KeyValueStoreGetAllActionRequester<Value> = ActionRequester<
  KeyValueStoreGetAllAction<Value>,
  Value[]
>;
