import { createErrorEnumForAction } from '../../types';
import { KeyValueStoreActionType } from './KeyValueStoreActionType';
import { KeyValueStoreQueryActionRequester, KeyValueStoreQueryOptions } from './KeyValueStoreQueryActionTypes';
import { KvsQueryOperation } from './types';

export const KeyValueStoreQueryErrorTypeEnum = createErrorEnumForAction(KeyValueStoreActionType.Query, [
  'ServiceUnavailable', // DynamoDB internal error / throttling
  'ResourceNotFound', // the underlying table does not exist
  'InvalidScope', // scope is malformed or the store's partition key is not string-typed
]);

export function* askKeyValueStoreQuery<KvsItem>(
  keyValueStoreName: string,

  keyCondition: KvsQueryOperation,
  options?: KeyValueStoreQueryOptions,
): KeyValueStoreQueryActionRequester<KvsItem> {
  return yield {
    type: KeyValueStoreActionType.Query,
    payload: {
      keyValueStoreName,

      keyCondition,

      options,
    },
  };
}
