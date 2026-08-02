import { createErrorEnumForAction } from '../../types';
import { KeyValueStoreActionType } from './KeyValueStoreActionType';
import { KeyValueStoreUpsertManyActionRequester, KeyValueStoreUpsertManyOptions } from './KeyValueStoreUpsertManyActionTypes';

export const KeyValueStoreUpsertManyErrorTypeEnum = createErrorEnumForAction(KeyValueStoreActionType.UpsertMany, [
  'ServiceUnavailable',
  'ResourceNotFound',
  'InvalidScope', // scope is malformed or the store's partition key is not string-typed
  'StoreNotFound', // the store is not declared in the qpq config (misconfiguration)
  // Two items in one batch share a primary key. Rejected up front on every
  // runtime, before anything is written: DynamoDB rejects same-key duplicates
  // only when they land in the same 25-item BatchWriteItem chunk (across chunks
  // the later write silently wins), so without this check the outcome would
  // depend on item position and never reproduce locally.
  'DuplicateKey',
]);

// Write many items in ONE action. The batch primitive for bulk writers (an
// event-log fan-out persisting hundreds of rows should not pay one action per
// row): processors batch the underlying writes (DynamoDB BatchWriteItem in
// chunks of 25, one repository pass locally) and retry partial acceptance
// internally, so the call is all-or-error from the story's point of view.
//
// UNCONDITIONAL, unlike askKeyValueStoreUpsert: batch writes cannot carry an
// ifNotExists condition (BatchWriteItem has no ConditionExpression), so this is
// only for items whose keys are unique by construction — a caller that needs
// the write race surfaced must use the single Upsert.
export function* askKeyValueStoreUpsertMany<KvsItem>(
  keyValueStoreName: string,
  items: KvsItem[],
  options?: KeyValueStoreUpsertManyOptions,
): KeyValueStoreUpsertManyActionRequester<KvsItem> {
  return yield {
    type: KeyValueStoreActionType.UpsertMany,
    payload: {
      keyValueStoreName,
      items,
      options,
    },
  };
}
