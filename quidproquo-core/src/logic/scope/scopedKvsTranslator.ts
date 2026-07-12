import { KvsCoreDataType, KvsLogicalOperatorType, KvsQueryOperation } from '../../actions/keyValueStore/types';
import { composeScopedKvsQueryOperation, stripScopedKvsItem, validateScopedQueryConstrainsPkOrThrow } from './scopedKvsQueryOperation';
import { buildKvsScopeBeginsWithCondition, composeScopedKvsValue } from './scopedKvsValue';

/**
 * Everything a value-composed backend (dynamo) needs to scope one store, in one
 * object. The pk appears in a different shape per action - a bare key, a field
 * inside the item, buried in a condition tree, or absent entirely - so each
 * shape gets one method instead of each processor wiring the low-level helpers.
 *
 * Unscoped requests get the identity translator: every method is a passthrough,
 * so processors never branch on `scope === undefined`.
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

export const createScopedKvsTranslator = (scope: string | undefined, pkAttributeName: string): ScopedKvsTranslator => {
  if (scope === undefined) {
    return identityTranslator;
  }

  const strip = <T>(item: T): T =>
    item && typeof item === 'object' ? (stripScopedKvsItem(scope, item as Record<string, any>, pkAttributeName) as unknown as T) : item;

  return {
    key: (key) => composeScopedKvsValue(scope, key),

    item: (item) => ({ ...item, [pkAttributeName]: composeScopedKvsValue(scope, item[pkAttributeName]) }),

    keyCondition: (operation) => {
      validateScopedQueryConstrainsPkOrThrow(scope, operation, [pkAttributeName]);
      return composeScopedKvsQueryOperation(scope, operation, [pkAttributeName]).operation;
    },

    filter: (operation) => (operation ? composeScopedKvsQueryOperation(scope, operation, [pkAttributeName]).operation : operation),

    scanFilter: (operation) => {
      const scopeCondition = buildKvsScopeBeginsWithCondition(pkAttributeName, scope);
      const rewritten = operation ? composeScopedKvsQueryOperation(scope, operation, [pkAttributeName]).operation : undefined;

      return rewritten ? { operation: KvsLogicalOperatorType.And, conditions: [scopeCondition, rewritten] } : scopeCondition;
    },

    strip,
  };
};
