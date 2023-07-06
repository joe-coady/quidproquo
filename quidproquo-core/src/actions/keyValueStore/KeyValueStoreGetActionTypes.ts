import { KeyValueStoreActionType } from './KeyValueStoreActionType';
import { Action, ActionProcessor, ActionRequester } from '../../types/Action';

import { ResourceName } from '../../types';

// Options Type
export interface KeyValueStoreGetOptions {
  // Add options here as needed, for example, read consistency
}

// Payload
export interface KeyValueStoreGetActionPayload {
  keyValueStoreName: ResourceName;
  key: string;
  options?: KeyValueStoreGetOptions;
}

// Action
export interface KeyValueStoreGetAction<Value> extends Action<KeyValueStoreGetActionPayload> {
  type: KeyValueStoreActionType.Get;
  payload: KeyValueStoreGetActionPayload;
}

// Function Types
export type KeyValueStoreGetActionProcessor<Value> = ActionProcessor<
  KeyValueStoreGetAction<Value>,
  Value | null
>;
export type KeyValueStoreGetActionRequester<Value> = ActionRequester<
  KeyValueStoreGetAction<Value>,
  Value | null
>;
