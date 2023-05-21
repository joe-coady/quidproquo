import { KeyValueStoreActionType } from './KeyValueStoreActionType';
import {
  KeyValueStoreUpsertActionRequester,
  KeyValueStoreUpsertOptions,
} from './KeyValueStoreUpsertActionTypes';

export function* askKeyValueStoreUpsert<KvsItem>(
  keyValueStoreName: string,
  item: KvsItem,
  options?: KeyValueStoreUpsertOptions,
): KeyValueStoreUpsertActionRequester<KvsItem> {
  return yield {
    type: KeyValueStoreActionType.Upsert,
    payload: {
      keyValueStoreName,
      item,
      options,
    },
  };
}
