import { KeyValueStoreActionType } from './KeyValueStoreActionType';
import { KeyValueStoreQueryActionRequester } from './KeyValueStoreQueryActionTypes';

import { KvsQueryOperation } from './types';
import { ResourceName } from '../../types';

export function* askKeyValueStoreQuery<KvsItem>(
  keyValueStoreName: ResourceName,

  keyCondition: KvsQueryOperation,
  filterCondition?: KvsQueryOperation,

  nextPageKey?: string,
): KeyValueStoreQueryActionRequester<KvsItem> {
  return yield {
    type: KeyValueStoreActionType.Query,
    payload: {
      keyValueStoreName,

      keyCondition,
      filterCondition,

      nextPageKey,
    },
  };
}
