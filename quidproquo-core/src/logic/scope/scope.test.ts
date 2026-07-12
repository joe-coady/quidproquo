import { describe, expect, it } from 'vitest';

import { KvsQueryOperationType } from '../../actions/keyValueStore/types';
import { composeScopedFilePath } from './composeScopedFilePath';
import { InvalidScopeError, InvalidScopeErrorCode } from './InvalidScopeError';
import { composeScopedKvsQueryOperation, validateScopedQueryConstrainsPkOrThrow } from './scopedKvsQueryOperation';
import { buildKvsScopeBeginsWithCondition, composeScopedKvsValue, stripScopedKvsValue } from './scopedKvsValue';
import { stripScopedFilePath } from './stripScopedFilePath';
import { validateScopeSegment } from './validateScopeSegment';

const expectInvalidScope = (fn: () => unknown, code: InvalidScopeErrorCode) => {
  try {
    fn();
    expect.unreachable('expected InvalidScopeError');
  } catch (error) {
    expect(error).toBeInstanceOf(InvalidScopeError);
    expect((error as InvalidScopeError).code).toBe(code);
  }
};

describe('validateScopeSegment', () => {
  it('accepts opaque ids', () => {
    expect(() => validateScopeSegment('0198f2ab-6cf2-7bbc-9c33-7a2d1f0a1c11')).not.toThrow();
    expect(() => validateScopeSegment('tenant-abc_123')).not.toThrow();
  });

  it('rejects empty and whitespace-only scopes', () => {
    expectInvalidScope(() => validateScopeSegment(''), InvalidScopeErrorCode.empty);
    expectInvalidScope(() => validateScopeSegment('   '), InvalidScopeErrorCode.empty);
  });

  it('rejects separators, traversal sequences, and null bytes', () => {
    expectInvalidScope(() => validateScopeSegment('a/b'), InvalidScopeErrorCode.unsafeCharacters);
    expectInvalidScope(() => validateScopeSegment('a\\b'), InvalidScopeErrorCode.unsafeCharacters);
    expectInvalidScope(() => validateScopeSegment('..'), InvalidScopeErrorCode.unsafeCharacters);
    expectInvalidScope(() => validateScopeSegment('a..b'), InvalidScopeErrorCode.unsafeCharacters);
    expectInvalidScope(() => validateScopeSegment('a\0b'), InvalidScopeErrorCode.unsafeCharacters);
  });

  it('rejects the kvs scope delimiter character', () => {
    // A scope containing ':' could forge or shadow another scope's composed
    // prefix ('a:' + ':b' vs 'a' + '::b').
    expectInvalidScope(() => validateScopeSegment('a:b'), InvalidScopeErrorCode.unsafeCharacters);
    expectInvalidScope(() => validateScopeSegment('acme::'), InvalidScopeErrorCode.unsafeCharacters);
  });

  it('rejects overly long scopes', () => {
    expectInvalidScope(() => validateScopeSegment('x'.repeat(129)), InvalidScopeErrorCode.tooLong);
    expect(() => validateScopeSegment('x'.repeat(128))).not.toThrow();
  });
});

describe('composeScopedFilePath', () => {
  it('returns the filepath unchanged without a scope', () => {
    expect(composeScopedFilePath(undefined, 'a/b.txt')).toBe('a/b.txt');
  });

  it('prefixes the scope as a single path segment', () => {
    expect(composeScopedFilePath('tenant-a', 'a/b.txt')).toBe('tenant-a/a/b.txt');
  });

  it('rejects an invalid scope', () => {
    expectInvalidScope(() => composeScopedFilePath('../evil', 'a.txt'), InvalidScopeErrorCode.unsafeCharacters);
  });

  it('rejects a filepath that could traverse out of the scope', () => {
    expectInvalidScope(() => composeScopedFilePath('tenant-a', '../tenant-b/secret.txt'), InvalidScopeErrorCode.unsafePath);
    expectInvalidScope(() => composeScopedFilePath('tenant-a', 'a/../../tenant-b/secret.txt'), InvalidScopeErrorCode.unsafePath);
    expectInvalidScope(() => composeScopedFilePath('tenant-a', 'a\\..\\b.txt'), InvalidScopeErrorCode.unsafePath);
    expectInvalidScope(() => composeScopedFilePath('tenant-a', '/etc/passwd'), InvalidScopeErrorCode.unsafePath);
    expectInvalidScope(() => composeScopedFilePath('tenant-a', 'a\0b.txt'), InvalidScopeErrorCode.unsafePath);
  });

  it('allows dot-prefixed names that are not traversal segments', () => {
    expect(composeScopedFilePath('tenant-a', '.hidden/..file.txt')).toBe('tenant-a/.hidden/..file.txt');
  });
});

describe('composeScopedKvsValue / stripScopedKvsValue', () => {
  it('round-trips a scoped string value', () => {
    const stored = composeScopedKvsValue('tenant-a', 'item-1');
    expect(stored).toBe('tenant-a::item-1');
    expect(stripScopedKvsValue('tenant-a', stored)).toBe('item-1');
  });

  it('passes values through untouched without a scope', () => {
    expect(composeScopedKvsValue(undefined, 'item-1')).toBe('item-1');
    expect(composeScopedKvsValue(undefined, 42)).toBe(42);
    expect(stripScopedKvsValue(undefined, 'tenant-a::item-1')).toBe('tenant-a::item-1');
  });

  it('rejects scoping a non-string value', () => {
    expectInvalidScope(() => composeScopedKvsValue('tenant-a', 42), InvalidScopeErrorCode.unsafeCharacters);
  });

  it('rejects a raw value containing the scope delimiter', () => {
    // 'tenant-a' + 'x::y' would store 'tenant-a::x::y'; on strip it reads back
    // as 'x::y', but an unscoped row 'acme::secret' must never be forgeable or
    // matchable as scoped data, so the delimiter is reserved outright.
    expectInvalidScope(() => composeScopedKvsValue('tenant-a', 'x::y'), InvalidScopeErrorCode.reservedDelimiter);
  });

  it('leaves an unscoped stored value unchanged when stripping', () => {
    expect(stripScopedKvsValue('tenant-a', 'item-1')).toBe('item-1');
    expect(stripScopedKvsValue('tenant-a', 7)).toBe(7);
  });
});

describe('stripScopedFilePath', () => {
  it('round-trips with composeScopedFilePath', () => {
    expect(stripScopedFilePath('tenant-a', composeScopedFilePath('tenant-a', 'a/b.txt'))).toBe('a/b.txt');
  });

  it('passes paths through untouched without a scope', () => {
    expect(stripScopedFilePath(undefined, 'tenant-a/a/b.txt')).toBe('tenant-a/a/b.txt');
  });

  it('leaves an unscoped stored path unchanged', () => {
    expect(stripScopedFilePath('tenant-a', 'a/b.txt')).toBe('a/b.txt');
  });
});

describe('composeScopedKvsQueryOperation', () => {
  it('rewrites both bounds of a Between condition on the partition key', () => {
    const { operation, scopedConditionCount } = composeScopedKvsQueryOperation(
      'tenant-a',
      { key: 'id', operation: KvsQueryOperationType.Between, valueA: 'a', valueB: 'z' },
      ['id'],
    );

    expect(scopedConditionCount).toBe(1);
    expect(operation).toEqual({ key: 'id', operation: KvsQueryOperationType.Between, valueA: 'tenant-a::a', valueB: 'tenant-a::z' });
  });

  it('rejects a non-string bound on the partition key', () => {
    expectInvalidScope(
      () => composeScopedKvsQueryOperation('tenant-a', { key: 'id', operation: KvsQueryOperationType.Between, valueA: 'a', valueB: true }, ['id']),
      InvalidScopeErrorCode.unsafeCharacters,
    );
  });
});

describe('validateScopedQueryConstrainsPkOrThrow', () => {
  it('passes a query that constrains the partition key', () => {
    expect(() =>
      validateScopedQueryConstrainsPkOrThrow('tenant-a', { key: 'id', operation: KvsQueryOperationType.Equal, valueA: 'x' }, ['id']),
    ).not.toThrow();
  });

  it('rejects a query that never constrains the partition key', () => {
    expectInvalidScope(
      () => validateScopedQueryConstrainsPkOrThrow('tenant-a', { key: 'name', operation: KvsQueryOperationType.Equal, valueA: 'x' }, ['id']),
      InvalidScopeErrorCode.queryMissingPartitionKey,
    );
  });
});

describe('buildKvsScopeBeginsWithCondition', () => {
  it('builds a begins-with predicate on the pk attribute', () => {
    expect(buildKvsScopeBeginsWithCondition('id', 'tenant-a')).toEqual({
      key: 'id',
      operation: 'BeginsWith',
      valueA: 'tenant-a::',
    });
  });
});
