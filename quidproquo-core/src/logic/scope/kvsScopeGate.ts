import { KvsCoreDataType, KvsQueryOperation } from '../../actions/keyValueStore/types';
import { KeyValueStoreQPQConfigSetting, QPQConfig } from '../../config';
import { getKeyValueStoreByName } from '../../qpqCoreUtils';
import { KvsStoreNotFoundError } from './KvsStoreNotFoundError';
import { createScopedKvsTranslator, ScopedKvsTranslator } from './scopedKvsTranslator';
import { validateScopeSupportedForPartitionKeyType } from './scopedKvsValue';
import { validateScopeSegment } from './validateScopeSegment';

// THE shared scope gate for every kvs backend (dynamo, dev-server json, ...):
// resolve the store's config, validate the scope against it, and hand back
// what the backend needs. Lives in core so the value-composed and
// file-partitioned backends can never drift apart on validation.

// Store lookup with the typed misconfiguration error (never a bare throw).
export const resolveKvsStoreConfigOrThrow = (qpqConfig: QPQConfig, keyValueStoreName: string): KeyValueStoreQPQConfigSetting => {
  const storeConfig = getKeyValueStoreByName(qpqConfig, keyValueStoreName);
  if (!storeConfig) {
    throw new KvsStoreNotFoundError(keyValueStoreName);
  }

  return storeConfig;
};

// Value-composed backends (dynamo): validate and hand back the translator that
// knows how to scope every shape the pk appears in - a bare key, an item
// field, a query condition tree, a scan filter, and stripping results.
// Unscoped requests get the identity translator (plus the composed-row scan
// exclusion when the store's string pk is known), so callers never branch on
// scope.
export const getScopedKvsTranslatorOrThrow = (qpqConfig: QPQConfig, keyValueStoreName: string, scope: string | undefined): ScopedKvsTranslator => {
  const storeConfig = resolveKvsStoreConfigOrThrow(qpqConfig, keyValueStoreName);

  if (scope === undefined) {
    // Only a string pk can hold composed values, so only then does the
    // unscoped scan exclusion apply.
    const stringPkAttribute = storeConfig.partitionKey.type === 'string' ? storeConfig.partitionKey.key : '';
    return createScopedKvsTranslator(undefined, stringPkAttribute);
  }

  validateScopeSegment(scope);
  validateScopeSupportedForPartitionKeyType(storeConfig.partitionKey.type);

  return createScopedKvsTranslator(scope, storeConfig.partitionKey.key);
};

// File-partitioned backends (dev-server json): the scope becomes a FOLDER
// name, so the same validations apply, but all the backend needs back is the
// real partition key attribute name.
export const resolveScopedPkAttributeOrThrow = (qpqConfig: QPQConfig, keyValueStoreName: string, scope: string): string => {
  const storeConfig = resolveKvsStoreConfigOrThrow(qpqConfig, keyValueStoreName);

  validateScopeSegment(scope);
  validateScopeSupportedForPartitionKeyType(storeConfig.partitionKey.type);

  return storeConfig.partitionKey.key;
};

// Validation-only counterparts for file-partitioned backends. They store keys
// and items raw (the scope just picks the file), but anything the
// value-composed translator would reject must fail locally too - same scope
// validation, same reserved-delimiter rule - so local behavior matches
// deployed behavior. The composed results are discarded.

export const validateScopedKvsKeyOrThrow = (
  qpqConfig: QPQConfig,
  keyValueStoreName: string,
  scope: string | undefined,
  key: KvsCoreDataType,
): void => {
  getScopedKvsTranslatorOrThrow(qpqConfig, keyValueStoreName, scope).key(key);
};

export const validateScopedKvsItemOrThrow = (
  qpqConfig: QPQConfig,
  keyValueStoreName: string,
  scope: string | undefined,
  item: Record<string, any>,
): void => {
  getScopedKvsTranslatorOrThrow(qpqConfig, keyValueStoreName, scope).item(item ?? {});
};

export const validateScopedKvsKeyConditionOrThrow = (
  qpqConfig: QPQConfig,
  keyValueStoreName: string,
  scope: string | undefined,
  keyCondition: KvsQueryOperation,
): void => {
  getScopedKvsTranslatorOrThrow(qpqConfig, keyValueStoreName, scope).keyCondition(keyCondition);
};
