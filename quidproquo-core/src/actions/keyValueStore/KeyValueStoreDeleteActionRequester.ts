import { KeyValueStoreActionType } from './KeyValueStoreActionType';
import { KeyValueStoreDeleteActionRequester, KeyValueStoreDeleteOptions } from './KeyValueStoreDeleteActionTypes';
import { KvsCoreDataType } from './types';

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
