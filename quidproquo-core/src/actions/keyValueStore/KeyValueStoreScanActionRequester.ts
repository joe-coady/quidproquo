import { createErrorEnumForAction } from '../../types';
import { KeyValueStoreActionType } from './KeyValueStoreActionType';
import { KeyValueStoreScanActionRequester, KeyValueStoreScanOptions } from './KeyValueStoreScanActionTypes';
import { KvsQueryOperation } from './types';

export const KeyValueStoreScanErrorTypeEnum = createErrorEnumForAction(KeyValueStoreActionType.Scan, [
  'ServiceUnavailable', // DynamoDB internal error / throttling
  'ResourceNotFound', // the underlying table does not exist
  'InvalidScope', // scope is malformed or the store's partition key is not string-typed
  'StoreNotFound', // the store is not declared in the qpq config (misconfiguration)
]);

export function* askKeyValueStoreScan<KvsItem>(
  keyValueStoreName: string,
  filterCondition?: KvsQueryOperation,
  nextPageKey?: string,
  options?: KeyValueStoreScanOptions,
): KeyValueStoreScanActionRequester<KvsItem> {
  return yield {
    type: KeyValueStoreActionType.Scan,
    payload: {
      keyValueStoreName,

      filterCondition,

      nextPageKey,

      options,
    },
  };
}
