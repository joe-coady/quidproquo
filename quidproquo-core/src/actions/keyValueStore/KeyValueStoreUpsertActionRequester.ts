import { KeyValueStoreActionType } from './KeyValueStoreActionType';
import {
  KeyValueStoreUpsertActionRequester,
  KeyValueStoreUpsertOptions,
} from './KeyValueStoreUpsertActionTypes';

import { ResourceName } from '../../types';

export function* askKeyValueStoreUpsert<KvsItem>(
  keyValueStoreName: ResourceName,
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
