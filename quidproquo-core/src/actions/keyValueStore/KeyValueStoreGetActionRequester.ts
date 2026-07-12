import { createErrorEnumForAction } from '../../types';
import { KeyValueStoreActionType } from './KeyValueStoreActionType';
import { KeyValueStoreGetActionRequester, KeyValueStoreGetOptions } from './KeyValueStoreGetActionTypes';

export const KeyValueStoreGetErrorTypeEnum = createErrorEnumForAction(KeyValueStoreActionType.Get, [
  'ServiceUnavailable', // DynamoDB internal error / throttling
  'ResourceNotFound', // the underlying table does not exist
  'InvalidScope', // scope is malformed or the store's partition key is not string-typed
]);

export function* askKeyValueStoreGet<Value>(
  keyValueStoreName: string,
  key: string,
  options?: KeyValueStoreGetOptions,
): KeyValueStoreGetActionRequester<Value> {
  return yield {
    type: KeyValueStoreActionType.Get,
    payload: {
      keyValueStoreName,
      key,
      options,
    },
  };
}
