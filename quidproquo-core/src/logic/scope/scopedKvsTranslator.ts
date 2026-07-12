import { KvsCoreDataType, KvsLogicalOperatorType, KvsQueryOperation } from '../../actions/keyValueStore/types';
import {
  composeScopedKvsQueryOperation,
  composeScopedKvsQueryOperationOrThrow,
  stripScopedKvsItem,
  validateUnscopedPkConditionValuesOrThrow,
} from './scopedKvsQueryOperation';
import {
  buildKvsScopeBeginsWithCondition,
  buildKvsScopeExclusionCondition,
  composeScopedKvsValue,
  validateRawPkValueForScopeOrThrow,
} from './scopedKvsValue';

/**
 * Everything a value-composed backend (dynamo) needs to scope one store, in one
 * object. The pk appears in a different shape per action - a bare key, a field
 * inside the item, buried in a condition tree, or absent entirely - so each
 * shape gets one method instead of each processor wiring the low-level helpers.
 *
 * Unscoped requests get a near-identity translator, so processors never branch
 * on `scope === undefined`. When the store's (string) pk attribute is known it
 * still guards the scope boundary in both directions: scanFilter excludes
 * scope-composed rows (an unscoped Scan/GetAll over a mixed table would
 * otherwise return every tenant's rows with the composed `tenant::key` values
 * un-stripped), and key/item/keyCondition reject raw pk values carrying the
 * reserved delimiter (an unscoped 'acme::secret' would read or forge scope
 * acme's composed rows). This matches file-partitioned backends, where scoped
 * rows are physically unreachable from unscoped access.
 */
export type ScopedKvsTranslator = {
  /** Get/Update/Delete: prefix a bare key value. */
  key: (key: KvsCoreDataType) => KvsCoreDataType;
  /** Upsert: clone the item with its pk field prefixed. */
  item: <T extends Record<string, any>>(item: T) => T;
  /** Query: rewrite pk conditions to the composed form; throws if none exist. */
  keyCondition: (operation: KvsQueryOperation) => KvsQueryOperation;
  /** Optional filter: rewrite any pk legs; non-pk conditions untouched. */
  filter: (operation?: KvsQueryOperation) => KvsQueryOperation | undefined;
  /** Scan/GetAll: AND a begins_with scope predicate onto the caller's filter. */
  scanFilter: (operation?: KvsQueryOperation) => KvsQueryOperation | undefined;
  /** Reads: strip the prefix off a returned item (null/undefined passthrough). */
  strip: <T>(item: T) => T;
};

const identityTranslator: ScopedKvsTranslator = {
  key: (key) => key,
  item: (item) => item,
  keyCondition: (operation) => operation,
  filter: (operation) => operation,
  scanFilter: (operation) => operation,
  strip: (item) => item,
};

const createUnscopedTranslator = (pkAttributeName: string): ScopedKvsTranslator => {
  // Empty pk name = unknown store or non-string pk: composed rows cannot be
  // filtered (or cannot exist), so stay a pure passthrough.
  if (!pkAttributeName) {
    return identityTranslator;
  }

  // Reads and writes: an unscoped raw pk value carrying the reserved delimiter
  // could read or forge another scope's composed rows, so it is rejected on
  // the way in rather than matched.
  const guardedKey = (key: KvsCoreDataType): KvsCoreDataType => {
    validateRawPkValueForScopeOrThrow(key);
    return key;
  };

  const guardedItem = <T extends Record<string, any>>(item: T): T => {
    validateRawPkValueForScopeOrThrow(item[pkAttributeName]);
    return item;
  };

  const guardedKeyCondition = (operation: KvsQueryOperation): KvsQueryOperation => {
    validateUnscopedPkConditionValuesOrThrow(operation, [pkAttributeName]);
    return operation;
  };

  return {
    ...identityTranslator,
    key: guardedKey,
    item: guardedItem,
    keyCondition: guardedKeyCondition,
    scanFilter: (operation) => {
      const exclusion = buildKvsScopeExclusionCondition(pkAttributeName);
      return operation ? { operation: KvsLogicalOperatorType.And, conditions: [exclusion, operation] } : exclusion;
    },
  };
};

export const createScopedKvsTranslator = (scope: string | undefined, pkAttributeName: string): ScopedKvsTranslator => {
  if (scope === undefined) {
    return createUnscopedTranslator(pkAttributeName);
  }

  const strip = <T>(item: T): T =>
    item && typeof item === 'object' ? (stripScopedKvsItem(scope, item as Record<string, any>, pkAttributeName) as unknown as T) : item;

  return {
    key: (key) => composeScopedKvsValue(scope, key),

    item: (item) => ({ ...item, [pkAttributeName]: composeScopedKvsValue(scope, item[pkAttributeName]) }),

    keyCondition: (operation) => composeScopedKvsQueryOperationOrThrow(scope, operation, [pkAttributeName]),

    filter: (operation) => (operation ? composeScopedKvsQueryOperation(scope, operation, [pkAttributeName]).operation : operation),

    scanFilter: (operation) => {
      const scopeCondition = buildKvsScopeBeginsWithCondition(pkAttributeName, scope);
      const rewritten = operation ? composeScopedKvsQueryOperation(scope, operation, [pkAttributeName]).operation : undefined;

      return rewritten ? { operation: KvsLogicalOperatorType.And, conditions: [scopeCondition, rewritten] } : scopeCondition;
    },

    strip,
  };
};
