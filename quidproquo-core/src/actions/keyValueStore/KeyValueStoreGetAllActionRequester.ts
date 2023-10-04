import { KeyValueStoreActionType } from './KeyValueStoreActionType';
import {
  KeyValueStoreGetAllActionRequester,
  KeyValueStoreGetAllOptions,
} from './KeyValueStoreGetAllActionTypes';

export function* askKeyValueStoreGetAll<Value>(
  keyValueStoreName: string,
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
