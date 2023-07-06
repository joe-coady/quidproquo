import { KeyValueStoreActionType } from './KeyValueStoreActionType';
import {
  KeyValueStoreGetAllActionRequester,
  KeyValueStoreGetAllOptions,
} from './KeyValueStoreGetAllActionTypes';

import { ResourceName } from '../../types';

export function* askKeyValueStoreGetAll<Value>(
  keyValueStoreName: ResourceName,
  options?: KeyValueStoreGetAllOptions,
): KeyValueStoreGetAllActionRequester<Value> {
  return yield {
    type: KeyValueStoreActionType.GetAll,
    payload: {
      keyValueStoreName,
      options,
    },
  };
}
