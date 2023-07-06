import { KeyValueStoreActionType } from './KeyValueStoreActionType';
import { KeyValueStoreScanActionRequester } from './KeyValueStoreScanActionTypes';

import { KvsQueryOperation } from './types';

import { ResourceName } from '../../types';

export function* askKeyValueStoreScan<KvsItem>(
  keyValueStoreName: ResourceName,

  filterCondition?: KvsQueryOperation,
): KeyValueStoreScanActionRequester<KvsItem> {
  return yield {
    type: KeyValueStoreActionType.Scan,
    payload: {
      keyValueStoreName,

      filterCondition,
    },
  };
}
