import { createErrorEnumForAction } from '../../types';
import { KeyValueStoreActionType } from './KeyValueStoreActionType';
import { KeyValueStoreGetAllActionRequester, KeyValueStoreGetAllOptions } from './KeyValueStoreGetAllActionTypes';

export const KeyValueStoreGetAllErrorTypeEnum = createErrorEnumForAction(KeyValueStoreActionType.GetAll, [
  'ServiceUnavailable', // DynamoDB internal error / throttling
  'ResourceNotFound', // the underlying table does not exist
  'InvalidScope', // scope is malformed or the store's partition key is not string-typed
  'StoreNotFound', // the store is not declared in the qpq config (misconfiguration)
]);

export function* askKeyValueStoreGetAll<Value>(
  keyValueStoreName: string,
  options?: KeyValueStoreGetAllOptions,
): KeyValueStoreGetAllActionRequester<Value> {
  return yield {
    type: KeyValueStoreActionType.GetAll,
    payload: {
      keyValueStoreName,
      options,
    },
  };
}
