import { KeyValueStoreActionType } from './KeyValueStoreActionType';
import {
  KeyValueStoreUpdateActionRequester,
  KeyValueStoreUpdateOptions,
} from './KeyValueStoreUpdateActionTypes';

import { KvsCoreDataType, KvsUpdate } from './types';
import { ResourceName } from '../../types';

export function* askKeyValueStoreUpdate<Value>(
  keyValueStoreName: ResourceName,

  updates: KvsUpdate,

  key: KvsCoreDataType,
  sortKey?: KvsCoreDataType,

  options?: KeyValueStoreUpdateOptions,
): KeyValueStoreUpdateActionRequester<Value> {
  return yield {
    type: KeyValueStoreActionType.Update,
    payload: {
      keyValueStoreName,
      key,
      sortKey,
      updates,
      options,
    },
  };
}
