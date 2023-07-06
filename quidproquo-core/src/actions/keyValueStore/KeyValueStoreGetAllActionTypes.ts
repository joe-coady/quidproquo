import { KeyValueStoreActionType } from './KeyValueStoreActionType';
import { Action, ActionProcessor, ActionRequester } from '../../types/Action';

// Options Type
export interface KeyValueStoreGetAllOptions {
  // Add options here as needed, for example, read consistency
}

import { ResourceName } from '../../types';

// Payload
export interface KeyValueStoreGetAllActionPayload {
  keyValueStoreName: ResourceName;
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
