import { InvalidScopeError, InvalidScopeErrorCode } from './InvalidScopeError';

// Scopes are opaque ids (uuid-sized); anything longer is a misuse signal.
const MAX_SCOPE_LENGTH = 128;

// A scope must be usable as a single path segment and a single key prefix.
// Reject rather than sanitize: a scope containing separators or traversal
// sequences is never legitimate input, so normalizing it would only mask a bug
// (or an attack) upstream.
export function validateScopeSegment(scope: string): void {
  if (scope.trim().length === 0) {
    throw new InvalidScopeError(InvalidScopeErrorCode.empty, 'Scope must not be empty.');
  }

  if (scope.length > MAX_SCOPE_LENGTH) {
    throw new InvalidScopeError(InvalidScopeErrorCode.tooLong, `Scope must be at most ${MAX_SCOPE_LENGTH} characters.`);
  }

  if (scope.includes('/') || scope.includes('\\') || scope.includes('..') || scope.includes('\0')) {
    throw new InvalidScopeError(InvalidScopeErrorCode.unsafeCharacters, 'Scope must not contain path separators, "..", or null bytes.');
  }
}
