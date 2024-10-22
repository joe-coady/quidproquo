import { KeyValueStoreActionType } from './KeyValueStoreActionType';
import { KeyValueStoreGetActionRequester, KeyValueStoreGetOptions } from './KeyValueStoreGetActionTypes';

export function* askKeyValueStoreGet<Value>(
  keyValueStoreName: string,
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
