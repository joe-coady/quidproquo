import { KeyValueStoreActionType } from './KeyValueStoreActionType';
import { KeyValueStoreScanActionRequester } from './KeyValueStoreScanActionTypes';

import { KvsQueryOperation } from './types';

export function* askKeyValueStoreScan<KvsItem>(
  keyValueStoreName: string,
  filterCondition?: KvsQueryOperation,
  nextPageKey?: string,
): KeyValueStoreScanActionRequester<KvsItem> {
  return yield {
    type: KeyValueStoreActionType.Scan,
    payload: {
      keyValueStoreName,

      filterCondition,

      nextPageKey,
    },
  };
}
