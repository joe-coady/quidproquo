import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { KeyValueStoreActionType } from './KeyValueStoreActionType';

// Options Type
export interface KeyValueStoreUpsertManyOptions {
  // Composed into each item's partition key value by the processor; requires a string-typed partition key.
  scope?: string;
}

// Payload
export interface KeyValueStoreUpsertManyActionPayload<KvsItem> {
  keyValueStoreName: string;
  items: KvsItem[];
  options?: KeyValueStoreUpsertManyOptions;
}

// Action
export interface KeyValueStoreUpsertManyAction<KvsItem> extends Action<KeyValueStoreUpsertManyActionPayload<KvsItem>> {
  type: KeyValueStoreActionType.UpsertMany;
  payload: KeyValueStoreUpsertManyActionPayload<KvsItem>;
}

// Function Types
export type KeyValueStoreUpsertManyActionProcessor<KvsItem> = ActionProcessor<KeyValueStoreUpsertManyAction<KvsItem>, void>;
export type KeyValueStoreUpsertManyActionRequester<KvsItem> = ActionRequester<KeyValueStoreUpsertManyAction<KvsItem>, void>;
