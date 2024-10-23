import { KeyValueStoreQPQConfigSetting, KvsQueryOperation } from 'quidproquo-core';

import { isKvsLogicalOperator,isKvsQueryCondition } from './buildDynamoQuery';

export const getDynamoTableIndexByConfigAndQuery = <T extends object = any>(
  setting: KeyValueStoreQPQConfigSetting,
  query: KvsQueryOperation,
): string | undefined => {
  // Function to extract keys from a query
  const extractKeysFromQuery = (query: KvsQueryOperation): string[] => {
    if (isKvsQueryCondition(query)) {
      return [query.key];
    } else if (isKvsLogicalOperator(query)) {
      return query.conditions.flatMap(extractKeysFromQuery);
    }
    return [];
  };

  const queriedKeys = extractKeysFromQuery(query);

  // Find a matching index
  for (const index of setting.indexes) {
    if (queriedKeys.includes(index.partitionKey.key)) {
      return index.partitionKey.key;
    }
  }

  // No matching index found
  return undefined;
};
