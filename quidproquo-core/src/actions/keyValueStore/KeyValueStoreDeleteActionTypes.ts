import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { KeyValueStoreActionType } from './KeyValueStoreActionType';
import { KvsCoreDataType } from './types';

// Options Type
export interface KeyValueStoreDeleteOptions {}

// Payload
export interface KeyValueStoreDeleteActionPayload {
  keyValueStoreName: string;

  key: KvsCoreDataType;
  sortKey?: KvsCoreDataType;

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
