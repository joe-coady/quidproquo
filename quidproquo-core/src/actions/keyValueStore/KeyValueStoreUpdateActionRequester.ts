import { createErrorEnumForAction } from '../../types';
import { KeyValueStoreActionType } from './KeyValueStoreActionType';
import { KeyValueStoreUpdateActionRequester, KeyValueStoreUpdateOptions } from './KeyValueStoreUpdateActionTypes';
import { KvsCoreDataType, KvsUpdate } from './types';

export const KeyValueStoreUpdateErrorTypeEnum = createErrorEnumForAction(KeyValueStoreActionType.Update, [
  'ServiceUnavailable', // DynamoDB internal error / throttling
  'ResourceNotFound', // the underlying table does not exist
  'InvalidScope', // scope is malformed or the store's partition key is not string-typed
]);

export function* askKeyValueStoreUpdate<Value>(
  keyValueStoreName: string,

  updates: KvsUpdate,

  key: KvsCoreDataType,
  sortKey?: KvsCoreDataType,

  options?: KeyValueStoreUpdateOptions,
): KeyValueStoreUpdateActionRequester<Value> {
  return yield {
    type: KeyValueStoreActionType.Update,
    payload: {
      keyValueStoreName,
      key,
      sortKey,
      updates,
      options,
    },
  };
}
