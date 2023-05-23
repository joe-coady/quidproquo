import { KeyValueStoreActionType } from './KeyValueStoreActionType';
import { KeyValueStoreQueryActionRequester } from './KeyValueStoreQueryActionTypes';

import { KvsQueryOperation } from './types';

export function* askKeyValueStoreQuery<KvsItem>(
  keyValueStoreName: string,
  operations: KvsQueryOperation[],
): KeyValueStoreQueryActionRequester<KvsItem> {
  return yield {
    type: KeyValueStoreActionType.Query,
    payload: {
      keyValueStoreName,
      operations,
    },
  };
}
