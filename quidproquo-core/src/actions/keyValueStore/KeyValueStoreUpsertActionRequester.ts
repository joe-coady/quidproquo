import { createErrorEnumForAction } from '../../types';
import { KeyValueStoreActionType } from './KeyValueStoreActionType';
import { KeyValueStoreUpsertActionRequester, KeyValueStoreUpsertOptions } from './KeyValueStoreUpsertActionTypes';

export const KeyValueStoreUpsertErrorTypeEnum = createErrorEnumForAction(KeyValueStoreActionType.Upsert, [
  'ServiceUnavailable',
  'ResourceNotFound',
  // A conditional (ifNotExists) write lost to an existing item. Namespaced —
  // not ErrorTypeEnum.Conflict — so retry logic can target the write race
  // specifically without also catching domain-level conflicts.
  'Conflict',
  'InvalidScope', // scope is malformed or the store's partition key is not string-typed
]);

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
