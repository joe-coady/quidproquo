import { createErrorEnumForAction } from '../../types';
import { KeyValueStoreActionType } from './KeyValueStoreActionType';
import { KeyValueStoreDeleteActionRequester, KeyValueStoreDeleteOptions } from './KeyValueStoreDeleteActionTypes';
import { KvsCoreDataType } from './types';

export const KeyValueStoreDeleteErrorTypeEnum = createErrorEnumForAction(KeyValueStoreActionType.Delete, [
  'ServiceUnavailable', // DynamoDB internal error / throttling
  'ResourceNotFound', // the underlying table does not exist
]);

export function* askKeyValueStoreDelete(
  keyValueStoreName: string,
  key: KvsCoreDataType,
  sortKey?: KvsCoreDataType,
  options?: KeyValueStoreDeleteOptions,
): KeyValueStoreDeleteActionRequester {
  return yield {
    type: KeyValueStoreActionType.Delete,
    payload: {
      keyValueStoreName,

      key,
      sortKey,

      options,
    },
  };
}
