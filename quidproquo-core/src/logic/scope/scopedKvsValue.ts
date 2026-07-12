import { KvsCoreDataType, KvsQueryCondition, KvsQueryOperationType } from '../../actions/keyValueStore/types';
import { InvalidScopeError, InvalidScopeErrorCode } from './InvalidScopeError';
import { validateScopeSegment } from './validateScopeSegment';

export const KVS_SCOPE_DELIMITER = '::';

// Compose a scope into a partition key value: `${scope}::${rawValue}`. Only
// string keys can carry a scope - a number/binary pk has nowhere to embed the
// prefix, so scoping such a store is rejected rather than silently coerced.
export function composeScopedKvsValue(scope: string | undefined, rawValue: KvsCoreDataType): KvsCoreDataType {
  if (scope === undefined) {
    return rawValue;
  }

  validateScopeSegment(scope);

  if (typeof rawValue !== 'string') {
    throw new InvalidScopeError(InvalidScopeErrorCode.unsafeCharacters, 'Scope is only supported on string partition key values.');
  }

  return `${scope}${KVS_SCOPE_DELIMITER}${rawValue}`;
}

// Undo composeScopedKvsValue on a value read back from storage, so callers
// never see the composed form. A stored value that doesn't carry the expected
// prefix is returned unchanged (it was written unscoped).
export function stripScopedKvsValue(scope: string | undefined, storedValue: KvsCoreDataType): KvsCoreDataType {
  if (scope === undefined || typeof storedValue !== 'string') {
    return storedValue;
  }

  const prefix = `${scope}${KVS_SCOPE_DELIMITER}`;
  return storedValue.startsWith(prefix) ? storedValue.slice(prefix.length) : storedValue;
}

// Scope composes into the partition key's stored string value, so a store whose
// partition key is number/binary-typed cannot be scoped at all - reject before
// any read/write happens rather than silently matching nothing.
export function validateScopeSupportedForPartitionKeyType(partitionKeyType: string): void {
  if (partitionKeyType !== 'string') {
    throw new InvalidScopeError(
      InvalidScopeErrorCode.unsafeCharacters,
      `Scope is only supported on stores with a string partition key (got '${partitionKeyType}').`,
    );
  }
}

// A begins-with predicate on the partition key attribute, for enforcing scope
// on operations that have no key condition (Scan / GetAll).
export function buildKvsScopeBeginsWithCondition(pkAttributeName: string, scope: string): KvsQueryCondition {
  validateScopeSegment(scope);

  return {
    key: pkAttributeName,
    operation: KvsQueryOperationType.BeginsWith,
    valueA: `${scope}${KVS_SCOPE_DELIMITER}`,
  };
}
