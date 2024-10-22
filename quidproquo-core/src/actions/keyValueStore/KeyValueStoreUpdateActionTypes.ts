import { KeyValueStoreActionType } from './KeyValueStoreActionType';
import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { KvsUpdate, KvsCoreDataType } from './types';

// Options Type
export interface KeyValueStoreUpdateOptions {}

// Payload
export interface KeyValueStoreUpdateActionPayload<Value> {
  keyValueStoreName: string;

  key: KvsCoreDataType;
  sortKey?: KvsCoreDataType;

  updates: KvsUpdate;
  options?: KeyValueStoreUpdateOptions;
}

// Action
export interface KeyValueStoreUpdateAction<Value> extends Action<KeyValueStoreUpdateActionPayload<Value>> {
  type: KeyValueStoreActionType.Update;
  payload: KeyValueStoreUpdateActionPayload<Value>;
}

// Function Types
export type KeyValueStoreUpdateActionProcessor<Value> = ActionProcessor<KeyValueStoreUpdateAction<Value>, Value>;
export type KeyValueStoreUpdateActionRequester<Value> = ActionRequester<KeyValueStoreUpdateAction<Value>, Value>;
