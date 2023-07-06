import { KeyValueStoreActionType } from './KeyValueStoreActionType';
import {
  KeyValueStoreGetActionRequester,
  KeyValueStoreGetOptions,
} from './KeyValueStoreGetActionTypes';

import { ResourceName } from '../../types';

export function* askKeyValueStoreGet<Value>(
  keyValueStoreName: ResourceName,
  key: string,
  options?: KeyValueStoreGetOptions,
): KeyValueStoreGetActionRequester<Value> {
  return yield {
    type: KeyValueStoreActionType.Get,
    payload: {
      keyValueStoreName,
      key,
      options,
    },
  };
}
