import { KeyValueStoreActionType } from './KeyValueStoreActionType';
import { KeyValueStoreQueryActionRequester, KeyValueStoreQueryOptions } from './KeyValueStoreQueryActionTypes';
import { KvsQueryOperation } from './types';

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
