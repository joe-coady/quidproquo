import {
  createScopedKvsTranslator,
  QPQConfig,
  qpqCoreUtils,
  ScopedKvsTranslator,
  validateScopeSegment,
  validateScopeSupportedForPartitionKeyType,
} from 'quidproquo-core';

// THE entry point for kvs scoping in these processors: validate the scope
// against the store's config (throws InvalidScopeError on a malformed scope or
// a non-string partition key) and hand back the translator that knows how to
// scope every shape the pk appears in - a bare key, an item field, a query
// condition tree, a scan filter, and stripping results. Unscoped requests get
// the identity translator, so callers never branch on scope.
export const getScopedKvsTranslatorOrThrow = (qpqConfig: QPQConfig, keyValueStoreName: string, scope: string | undefined): ScopedKvsTranslator => {
  if (scope === undefined) {
    return createScopedKvsTranslator(undefined, '');
  }

  const storeConfig = qpqCoreUtils.getKeyValueStoreByName(qpqConfig, keyValueStoreName);
  if (!storeConfig) {
    throw new Error(`Key value store '${keyValueStoreName}' not found in configuration`);
  }

  validateScopeSegment(scope);
  validateScopeSupportedForPartitionKeyType(storeConfig.partitionKey.type);

  return createScopedKvsTranslator(scope, storeConfig.partitionKey.key);
};
