import { KeyValueStoreActionType } from './KeyValueStoreActionType';
import {
  KeyValueStoreDeleteActionRequester,
  KeyValueStoreDeleteOptions,
} from './KeyValueStoreDeleteActionTypes';

export function* askKeyValueStoreDelete(
  keyValueStoreName: string,
  key: string,
  options?: KeyValueStoreDeleteOptions,
): KeyValueStoreDeleteActionRequester {
  return yield {
    type: KeyValueStoreActionType.Delete,
    payload: {
      keyValueStoreName,
      key,
      options,
    },
  };
}
