import { KeyValueStoreActionType } from './KeyValueStoreActionType';
import { Action, ActionProcessor, ActionRequester } from '../../types/Action';

// Options Type
export interface KeyValueStoreDeleteOptions {
  // Add options here as needed, for example, conditional delete
}

// Payload
export interface KeyValueStoreDeleteActionPayload {
  keyValueStoreName: string;
  key: string;
  options?: KeyValueStoreDeleteOptions;
}

// Action
export interface KeyValueStoreDeleteAction extends Action<KeyValueStoreDeleteActionPayload> {
  type: KeyValueStoreActionType.Delete;
  payload: KeyValueStoreDeleteActionPayload;
}

// Function Types
export type KeyValueStoreDeleteActionProcessor = ActionProcessor<KeyValueStoreDeleteAction, void>;
export type KeyValueStoreDeleteActionRequester = ActionRequester<KeyValueStoreDeleteAction, void>;
