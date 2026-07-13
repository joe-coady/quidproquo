// Raised when a scope segment fails validation. Scope is an opaque identifier
// (supplied by a higher-level data-partitioning feature) that gets embedded
// into file paths and kvs partition keys, so a malformed one is always
// rejected outright - never normalized - to make escaping a scope impossible
// by construction.
export enum InvalidScopeErrorCode {
  // Empty or whitespace-only scope.
  empty = 'empty',
  // Contains a path separator, '..', or a null byte.
  unsafeCharacters = 'unsafeCharacters',
  // Longer than the allowed maximum (scopes are ids, not payloads).
  tooLong = 'tooLong',
  // A filepath composed under a scope could traverse out of it (absolute
  // path, a '..' segment, or a null byte).
  unsafePath = 'unsafePath',
  // A scoped query whose key condition never constrains the partition key -
  // on value-composed backends (dynamo) it would silently span every scope.
  queryMissingPartitionKey = 'queryMissingPartitionKey',
  // A raw partition-key value containing the scope delimiter: storing it would
  // make the row indistinguishable from another scope's composed data.
  reservedDelimiter = 'reservedDelimiter',
}

export class InvalidScopeError extends Error {
  constructor(
    public readonly code: InvalidScopeErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'InvalidScopeError';
  }
}
