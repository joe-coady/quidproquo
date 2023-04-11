import { KeyValueStoreActionType } from './KeyValueStoreActionType';
import {
  KeyValueStoreSetActionRequester,
  KeyValueStoreSetOptions,
} from './KeyValueStoreSetActionTypes';

export function* askKeyValueStoreSet<Value>(
  keyValueStoreName: string,
  key: string,
  value: Value,
  options?: KeyValueStoreSetOptions,
): KeyValueStoreSetActionRequester<Value> {
  return yield {
    type: KeyValueStoreActionType.Set,
    payload: {
      keyValueStoreName,
      key,
      value,
      options,
    },
  };
}
