import { AskResponse } from '../../types/StorySession';
import { createActionRequester } from '../../types/utils/createActionRequester';
import { KeyValueStoreActionType } from './KeyValueStoreActionType';
import { KvsCoreDataType, KvsUpdate } from './types';

export type KeyValueStoreUpdateOptions = {
  // Composed into the partition key value by the processor; requires a string-typed partition key.
  scope?: string;
};

export const askKeyValueStoreUpdateBase = createActionRequester<unknown>()({
  actionType: KeyValueStoreActionType.Update,
  errorTypes: [
    'ServiceUnavailable', // DynamoDB internal error / throttling
    'ResourceNotFound', // the underlying table does not exist
    'InvalidScope', // scope is malformed or the store's partition key is not string-typed
    'StoreNotFound', // the store is not declared in the qpq config (misconfiguration)
  ],
  getPayload: (
    keyValueStoreName: string,
    updates: KvsUpdate,
    key: KvsCoreDataType,
    sortKey?: KvsCoreDataType,
    options?: KeyValueStoreUpdateOptions,
  ) => ({ keyValueStoreName, key, sortKey, updates, options }),
});

// The updated item's shape is only known to the caller, so the base returns unknown and
// this story casts it to what the caller declared.
export function* askKeyValueStoreUpdate<Value>(
  keyValueStoreName: string,

  updates: KvsUpdate,

  key: KvsCoreDataType,
  sortKey?: KvsCoreDataType,

  options?: KeyValueStoreUpdateOptions,
): AskResponse<Value> {
  return (yield* askKeyValueStoreUpdateBase(keyValueStoreName, updates, key, sortKey, options)) as Value;
}
