import { KeyValueStoreQPQConfigSetting, KvsQueryOperation, Nullable } from 'quidproquo-core';

import { flattenKvsQueryConditions } from './flattenKvsQueryConditions';

/**
 * Pick the GSI that can serve the query, or null to query the primary table.
 * Returns the GSI's partition key name, which is also its index name (the CDK
 * construct names each GSI after its partition key).
 */
export const getDynamoTableIndexByConfigAndQuery = (setting: KeyValueStoreQPQConfigSetting, query: KvsQueryOperation): Nullable<string> => {
  const queriedKeys = flattenKvsQueryConditions(query).map((condition) => condition.key);

  // If the query includes the primary sort key, the primary table is a direct
  // match: prefer it over any GSI so we never land on a GSI with a non-SK
  // condition.
  const primarySortKey = setting.sortKeys[0]?.key;
  if (primarySortKey && queriedKeys.includes(primarySortKey)) {
    return null;
  }

  const matchingIndex = setting.indexes.find((index) => queriedKeys.includes(index.partitionKey.key));

  return matchingIndex ? matchingIndex.partitionKey.key : null;
};
