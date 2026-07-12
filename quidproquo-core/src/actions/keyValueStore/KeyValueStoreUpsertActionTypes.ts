import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { KeyValueStoreActionType } from './KeyValueStoreActionType';

// Options Type
export interface KeyValueStoreUpsertOptions {
  ttlInSeconds?: number; // Time-to-live in seconds

  // Conditional insert: only write when no item with the same key exists.
  // A losing concurrent writer gets ErrorTypeEnum.Conflict instead of silently
  // overwriting — the primitive for optimistic-concurrency schemes (e.g.
  // append-only event logs where the sort key is a claimed index).
  ifNotExists?: boolean;

  // Composed into the item's partition key value by the processor; requires a string-typed partition key.
  scope?: string;
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
