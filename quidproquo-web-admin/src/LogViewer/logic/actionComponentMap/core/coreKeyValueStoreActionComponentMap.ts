import { KeyValueStoreActionType } from 'quidproquo-core';

export const coreKeyValueStoreActionComponentMap: Record<string, string[]> = {
  [KeyValueStoreActionType.Query]: ['askKeyValueStoreQuery', 'keyValueStoreName', 'keyCondition', 'options'],
  [KeyValueStoreActionType.Upsert]: ['askKeyValueStoreUpsert', 'keyValueStoreName', 'item', 'options'],
};

export default coreKeyValueStoreActionComponentMap;
