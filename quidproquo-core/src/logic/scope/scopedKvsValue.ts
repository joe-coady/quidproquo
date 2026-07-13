import { KvsCoreDataType, KvsQueryCondition, KvsQueryOperationType } from '../../actions/keyValueStore/types';
import { InvalidScopeError, InvalidScopeErrorCode } from './InvalidScopeError';
import { validateScopeSegment } from './validateScopeSegment';

// The delimiter must never occur in legitimate partition key data, because raw
// values carrying it are rejected outright (see below). '::' is unusable: it is
// qpq's own function-runtime separator ('src/path::method') and appears inside
// correlation ids, which the log service stores as partition keys. So the
// delimiter is a loud qpq-namespaced sentinel instead of a short punctuation
// token.
export const KVS_SCOPE_DELIMITER = '@@QPQSCOPE@@';

// Compose a scope into a partition key value: `${scope}${KVS_SCOPE_DELIMITER}${rawValue}`. Only
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

  validateRawPkValueForScopeOrThrow(rawValue);

  return `${scope}${KVS_SCOPE_DELIMITER}${rawValue}`;
}

// The delimiter is reserved in scoped partition-key values: a raw value
// carrying it would strip ambiguously and could collide with (or forge)
// another scope's composed rows. File-partitioned backends call this directly
// for parity - they store values raw, but a value prod rejects must fail
// locally too.
export function validateRawPkValueForScopeOrThrow(rawValue: KvsCoreDataType): void {
  if (typeof rawValue === 'string' && rawValue.includes(KVS_SCOPE_DELIMITER)) {
    throw new InvalidScopeError(
      InvalidScopeErrorCode.reservedDelimiter,
      `Partition key values must not contain the scope delimiter '${KVS_SCOPE_DELIMITER}'.`,
    );
  }
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

// The inverse guard for UNSCOPED Scan / GetAll on a value-composed backend:
// exclude rows whose pk carries the scope delimiter, so unscoped listings never
// leak other tenants' (composed) rows. File-partitioned backends get this for
// free from the file boundary.
export function buildKvsScopeExclusionCondition(pkAttributeName: string): KvsQueryCondition {
  return {
    key: pkAttributeName,
    operation: KvsQueryOperationType.NotContains,
    valueA: KVS_SCOPE_DELIMITER,
  };
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
