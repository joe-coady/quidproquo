import { KeyValueStoreActionType } from './KeyValueStoreActionType';
import { Action, ActionProcessor, ActionRequester } from '../../types/Action';

// Options Type
export interface KeyValueStoreUpsertOptions {
  ttlInSeconds?: number; // Time-to-live in seconds
}

// Payload
export interface KeyValueStoreUpsertActionPayload<KvsItem> {
  keyValueStoreName: string;
  item: KvsItem;
  options?: KeyValueStoreUpsertOptions;
}

// Action
export interface KeyValueStoreUpsertAction<KvsItem> extends Action<KeyValueStoreUpsertActionPayload<KvsItem>> {
  type: KeyValueStoreActionType.Upsert;
  payload: KeyValueStoreUpsertActionPayload<KvsItem>;
}

// Function Types
export type KeyValueStoreUpsertActionProcessor<KvsItem> = ActionProcessor<KeyValueStoreUpsertAction<KvsItem>, void>;
export type KeyValueStoreUpsertActionRequester<KvsItem> = ActionRequester<KeyValueStoreUpsertAction<KvsItem>, void>;
