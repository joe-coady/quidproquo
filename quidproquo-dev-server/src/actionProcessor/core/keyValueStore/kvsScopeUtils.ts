import { QPQConfig, qpqCoreUtils, validateScopeSegment, validateScopeSupportedForPartitionKeyType } from 'quidproquo-core';

// Validate the scope against the store's config and return the real partition
// key attribute name. Throws InvalidScopeError on a malformed scope (critical
// here: the scope becomes a FOLDER name in the json backend) or a non-string
// partition key - the latter purely for AWS parity, where scope composes into
// the pk value, so a store that can't be scoped in prod fails locally too.
export const resolveScopedPkAttributeOrThrow = (qpqConfig: QPQConfig, keyValueStoreName: string, scope: string): string => {
  const storeConfig = qpqCoreUtils.getKeyValueStoreByName(qpqConfig, keyValueStoreName);
  if (!storeConfig) {
    throw new Error(`Key value store '${keyValueStoreName}' not found in configuration`);
  }

  validateScopeSegment(scope);
  validateScopeSupportedForPartitionKeyType(storeConfig.partitionKey.type);

  return storeConfig.partitionKey.key;
};
