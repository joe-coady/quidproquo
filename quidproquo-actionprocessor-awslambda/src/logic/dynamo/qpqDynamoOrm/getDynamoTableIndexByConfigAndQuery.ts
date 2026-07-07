import { KeyValueStoreQPQConfigSetting, KvsQueryOperation } from 'quidproquo-core';

import { isKvsLogicalOperator, isKvsQueryCondition } from './buildDynamoQuery';

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

  // If the query includes the primary sort key, the primary table is a direct match —
  // prefer it over any GSI so we never land on a GSI with a non-SK condition.
  const primarySortKey = setting.sortKeys[0]?.key;
  if (primarySortKey && queriedKeys.includes(primarySortKey)) {
    return undefined;
  }

  // Find a GSI whose partition key is in the query.
  for (const index of setting.indexes) {
    if (queriedKeys.includes(index.partitionKey.key)) {
      return index.partitionKey.key;
    }
  }

  return undefined;
};
