import { KeyValueStoreActionType } from './KeyValueStoreActionType';
import { KeyValueStoreQueryActionRequester } from './KeyValueStoreQueryActionTypes';

import { KvsQueryOperation } from './types';

export function* askKeyValueStoreQuery<KvsItem>(
  keyValueStoreName: string,

  keyCondition: KvsQueryOperation,
  filterCondition?: KvsQueryOperation,
): KeyValueStoreQueryActionRequester<KvsItem> {
  return yield {
    type: KeyValueStoreActionType.Query,
    payload: {
      keyValueStoreName,

      keyCondition,
      filterCondition,
    },
  };
}
