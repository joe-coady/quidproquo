export const coreKeyValueStoreActionComponentMap: Record<string, string[]> = {
  ['@quidproquo-core/KeyValueStore/Query']: ['askKeyValueStoreQuery', 'keyValueStoreName', 'keyCondition', 'options'],
  ['@quidproquo-core/KeyValueStore/Upsert']: ['askKeyValueStoreUpsert', 'keyValueStoreName', 'item', 'options'],
};

export default coreKeyValueStoreActionComponentMap;
