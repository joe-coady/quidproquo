import { describe, expect, it } from 'vitest';

import { KvsLogicalOperatorType, KvsQueryOperationType } from '../../actions/keyValueStore/types';
import { composeScopedFilePath } from './composeScopedFilePath';
import { InvalidScopeError, InvalidScopeErrorCode } from './InvalidScopeError';
import {
  composeScopedKvsQueryOperation,
  stripScopedKvsItem,
  validateScopedQueryConstrainsPkOrThrow,
  validateUnscopedPkConditionValuesOrThrow,
} from './scopedKvsQueryOperation';
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
    expect(() => validateScopeSegment('org-abc_123')).not.toThrow();
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
    // A scope containing '@' could forge or shadow another scope's composed
    // prefix ('a@' + '@QPQSCOPE@@b' vs 'a' + '@@QPQSCOPE@@b').
    expectInvalidScope(() => validateScopeSegment('a@b'), InvalidScopeErrorCode.unsafeCharacters);
    expectInvalidScope(() => validateScopeSegment('acme@@QPQSCOPE@@'), InvalidScopeErrorCode.unsafeCharacters);
  });

  it('accepts scopes containing ":" (no longer the delimiter character)', () => {
    expect(() => validateScopeSegment('a:b')).not.toThrow();
  });

  it('rejects the self-referencing path segment', () => {
    // './file' composed under scope '.' resolves to the unscoped root.
    expectInvalidScope(() => validateScopeSegment('.'), InvalidScopeErrorCode.unsafeCharacters);
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
    expect(composeScopedFilePath('scope-a', 'a/b.txt')).toBe('scope-a/a/b.txt');
  });

  it('rejects an invalid scope', () => {
    expectInvalidScope(() => composeScopedFilePath('../evil', 'a.txt'), InvalidScopeErrorCode.unsafeCharacters);
  });

  it('rejects a filepath that could traverse out of the scope', () => {
    expectInvalidScope(() => composeScopedFilePath('scope-a', '../scope-b/secret.txt'), InvalidScopeErrorCode.unsafePath);
    expectInvalidScope(() => composeScopedFilePath('scope-a', 'a/../../scope-b/secret.txt'), InvalidScopeErrorCode.unsafePath);
    expectInvalidScope(() => composeScopedFilePath('scope-a', 'a\\..\\b.txt'), InvalidScopeErrorCode.unsafePath);
    expectInvalidScope(() => composeScopedFilePath('scope-a', '/etc/passwd'), InvalidScopeErrorCode.unsafePath);
    expectInvalidScope(() => composeScopedFilePath('scope-a', 'a\0b.txt'), InvalidScopeErrorCode.unsafePath);
  });

  it('allows dot-prefixed names that are not traversal segments', () => {
    expect(composeScopedFilePath('scope-a', '.hidden/..file.txt')).toBe('scope-a/.hidden/..file.txt');
  });
});

describe('composeScopedKvsValue / stripScopedKvsValue', () => {
  it('round-trips a scoped string value', () => {
    const stored = composeScopedKvsValue('scope-a', 'item-1');
    expect(stored).toBe('scope-a@@QPQSCOPE@@item-1');
    expect(stripScopedKvsValue('scope-a', stored)).toBe('item-1');
  });

  it('passes values through untouched without a scope', () => {
    expect(composeScopedKvsValue(undefined, 'item-1')).toBe('item-1');
    expect(composeScopedKvsValue(undefined, 42)).toBe(42);
    expect(stripScopedKvsValue(undefined, 'scope-a@@QPQSCOPE@@item-1')).toBe('scope-a@@QPQSCOPE@@item-1');
  });

  it('rejects scoping a non-string value', () => {
    expectInvalidScope(() => composeScopedKvsValue('scope-a', 42), InvalidScopeErrorCode.unsafeCharacters);
  });

  it('rejects a raw value containing the scope delimiter', () => {
    // Storing 'scope-a' + delimiter + 'x' + delimiter + 'y' would read back
    // ambiguously, and an unscoped row carrying the delimiter must never be
    // forgeable or matchable as scoped data, so the delimiter is reserved
    // outright.
    expectInvalidScope(() => composeScopedKvsValue('scope-a', 'x@@QPQSCOPE@@y'), InvalidScopeErrorCode.reservedDelimiter);
  });

  // '::' is qpq's function-runtime separator and lives inside correlation ids,
  // which the log service stores as partition keys - it must round-trip fine.
  it('round-trips a value containing "::"', () => {
    const stored = composeScopedKvsValue('scope-a', 'onCreate::onCreate');
    expect(stored).toBe('scope-a@@QPQSCOPE@@onCreate::onCreate');
    expect(stripScopedKvsValue('scope-a', stored)).toBe('onCreate::onCreate');
  });

  it('leaves an unscoped stored value unchanged when stripping', () => {
    expect(stripScopedKvsValue('scope-a', 'item-1')).toBe('item-1');
    expect(stripScopedKvsValue('scope-a', 7)).toBe(7);
  });
});

describe('stripScopedFilePath', () => {
  it('round-trips with composeScopedFilePath', () => {
    expect(stripScopedFilePath('scope-a', composeScopedFilePath('scope-a', 'a/b.txt'))).toBe('a/b.txt');
  });

  it('passes paths through untouched without a scope', () => {
    expect(stripScopedFilePath(undefined, 'scope-a/a/b.txt')).toBe('scope-a/a/b.txt');
  });

  it('leaves an unscoped stored path unchanged', () => {
    expect(stripScopedFilePath('scope-a', 'a/b.txt')).toBe('a/b.txt');
  });
});

describe('composeScopedKvsQueryOperation', () => {
  it('rewrites both bounds of a Between condition on the partition key', () => {
    const { operation, scopedConditionCount } = composeScopedKvsQueryOperation(
      'scope-a',
      { key: 'id', operation: KvsQueryOperationType.Between, valueA: 'a', valueB: 'z' },
      ['id'],
    );

    expect(scopedConditionCount).toBe(1);
    expect(operation).toEqual({
      key: 'id',
      operation: KvsQueryOperationType.Between,
      valueA: 'scope-a@@QPQSCOPE@@a',
      valueB: 'scope-a@@QPQSCOPE@@z',
    });
  });

  it('rejects a non-string bound on the partition key', () => {
    expectInvalidScope(
      () => composeScopedKvsQueryOperation('scope-a', { key: 'id', operation: KvsQueryOperationType.Between, valueA: 'a', valueB: true }, ['id']),
      InvalidScopeErrorCode.unsafeCharacters,
    );
  });
});

describe('validateScopedQueryConstrainsPkOrThrow', () => {
  it('passes a query that constrains the partition key', () => {
    expect(() =>
      validateScopedQueryConstrainsPkOrThrow('scope-a', { key: 'id', operation: KvsQueryOperationType.Equal, valueA: 'x' }, ['id']),
    ).not.toThrow();
  });

  it('rejects a query that never constrains the partition key', () => {
    expectInvalidScope(
      () => validateScopedQueryConstrainsPkOrThrow('scope-a', { key: 'name', operation: KvsQueryOperationType.Equal, valueA: 'x' }, ['id']),
      InvalidScopeErrorCode.queryMissingPartitionKey,
    );
  });
});

describe('validateUnscopedPkConditionValuesOrThrow', () => {
  it('passes clean pk comparisons and ignores non-pk conditions', () => {
    const operation = {
      operation: KvsLogicalOperatorType.And,
      conditions: [
        { key: 'id', operation: KvsQueryOperationType.Equal, valueA: 'item-1' },
        // Non-pk conditions may legitimately contain '@@QPQSCOPE@@' (it is only reserved in the pk).
        { key: 'note', operation: KvsQueryOperationType.Equal, valueA: 'a@@QPQSCOPE@@b' },
      ],
    };

    expect(() => validateUnscopedPkConditionValuesOrThrow(operation, ['id'])).not.toThrow();
  });

  it('rejects the reserved delimiter in a pk comparison, including nested trees and In lists', () => {
    // An unscoped pk value 'acme@@QPQSCOPE@@secret' would match scope acme's composed rows.
    expectInvalidScope(
      () => validateUnscopedPkConditionValuesOrThrow({ key: 'id', operation: KvsQueryOperationType.Equal, valueA: 'acme@@QPQSCOPE@@secret' }, ['id']),
      InvalidScopeErrorCode.reservedDelimiter,
    );

    const nested = {
      operation: KvsLogicalOperatorType.Or,
      conditions: [
        { key: 'name', operation: KvsQueryOperationType.Equal, valueA: 'x' },
        {
          operation: KvsLogicalOperatorType.And,
          conditions: [{ key: 'id', operation: KvsQueryOperationType.In, valueA: ['ok', 'acme@@QPQSCOPE@@secret'] }],
        },
      ],
    };
    expectInvalidScope(() => validateUnscopedPkConditionValuesOrThrow(nested, ['id']), InvalidScopeErrorCode.reservedDelimiter);

    expectInvalidScope(
      () =>
        validateUnscopedPkConditionValuesOrThrow({ key: 'id', operation: KvsQueryOperationType.Between, valueA: 'a', valueB: 'acme@@QPQSCOPE@@z' }, [
          'id',
        ]),
      InvalidScopeErrorCode.reservedDelimiter,
    );
  });
});

describe('stripScopedKvsItem', () => {
  it('clones the item with the scope prefix stripped off its pk attribute', () => {
    const stored = { id: 'scope-a@@QPQSCOPE@@item-1', name: 'n' };

    const stripped = stripScopedKvsItem('scope-a', stored, 'id');

    expect(stripped).toEqual({ id: 'item-1', name: 'n' });
    expect(stored).toEqual({ id: 'scope-a@@QPQSCOPE@@item-1', name: 'n' });
  });

  it('returns the same item when the pk carries no prefix', () => {
    const stored = { id: 'item-1', name: 'n' };

    expect(stripScopedKvsItem('scope-a', stored, 'id')).toBe(stored);
  });
});

describe('buildKvsScopeBeginsWithCondition', () => {
  it('builds a begins-with predicate on the pk attribute', () => {
    expect(buildKvsScopeBeginsWithCondition('id', 'scope-a')).toEqual({
      key: 'id',
      operation: 'BeginsWith',
      valueA: 'scope-a@@QPQSCOPE@@',
    });
  });
});
