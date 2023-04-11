import { KeyValueStoreActionType } from './KeyValueStoreActionType';
import {
  KeyValueStoreUpdateActionRequester,
  KeyValueStoreUpdateOptions,
} from './KeyValueStoreUpdateActionTypes';

export function* askKeyValueStoreUpdate<Value>(
  keyValueStoreName: string,
  key: string,
  value: Partial<Value>,
  options?: KeyValueStoreUpdateOptions,
): KeyValueStoreUpdateActionRequester<Value> {
  return yield {
    type: KeyValueStoreActionType.Update,
    payload: {
      keyValueStoreName,
      key,
      value,
      options,
    },
  };
}
