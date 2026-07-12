import { describe, expect, it } from 'vitest';

import { KvsQueryOperationType } from '../../actions/keyValueStore/types';
import { defineKeyValueStore, kvsKey } from '../../config';
import { buildTestQpqConfig } from '../../testing';
import { InvalidScopeError, InvalidScopeErrorCode } from './InvalidScopeError';
import {
  getScopedKvsTranslatorOrThrow,
  resolveKvsStoreConfigOrThrow,
  resolveScopedPkAttributeOrThrow,
  validateScopedKvsItemOrThrow,
  validateScopedKvsKeyConditionOrThrow,
  validateScopedKvsKeyOrThrow,
} from './kvsScopeGate';
import { KvsStoreNotFoundError } from './KvsStoreNotFoundError';

const qpqConfig = buildTestQpqConfig([
  defineKeyValueStore('stringStore', kvsKey('id', 'string')),
  defineKeyValueStore('numberStore', kvsKey('seq', 'number')),
]);

const expectInvalidScope = (fn: () => unknown, code: InvalidScopeErrorCode) => {
  try {
    fn();
    expect.unreachable('expected InvalidScopeError');
  } catch (error) {
    expect(error).toBeInstanceOf(InvalidScopeError);
    expect((error as InvalidScopeError).code).toBe(code);
  }
};

describe('resolveKvsStoreConfigOrThrow', () => {
  it('returns the store config for a declared store', () => {
    expect(resolveKvsStoreConfigOrThrow(qpqConfig, 'stringStore').keyValueStoreName).toBe('stringStore');
  });

  it('throws the typed misconfiguration error for an undeclared store', () => {
    expect(() => resolveKvsStoreConfigOrThrow(qpqConfig, 'missingStore')).toThrow(KvsStoreNotFoundError);
  });
});

describe('getScopedKvsTranslatorOrThrow', () => {
  it('returns a composing translator for a valid scope on a string-pk store', () => {
    const translator = getScopedKvsTranslatorOrThrow(qpqConfig, 'stringStore', 'tenant-a');

    expect(translator.key('item-1')).toBe('tenant-a::item-1');
  });

  it('returns the unscoped translator with the composed-row scan exclusion for a string-pk store', () => {
    const translator = getScopedKvsTranslatorOrThrow(qpqConfig, 'stringStore', undefined);

    expect(translator.key('item-1')).toBe('item-1');
    expect(translator.scanFilter(undefined)).toEqual({ key: 'id', operation: KvsQueryOperationType.NotContains, valueA: '::' });
  });

  it('returns a pure passthrough for an unscoped number-pk store', () => {
    const translator = getScopedKvsTranslatorOrThrow(qpqConfig, 'numberStore', undefined);

    expect(translator.scanFilter(undefined)).toBeUndefined();
  });

  it('rejects an invalid scope, a number-pk store, and an unknown store', () => {
    expectInvalidScope(() => getScopedKvsTranslatorOrThrow(qpqConfig, 'stringStore', '../evil'), InvalidScopeErrorCode.unsafeCharacters);
    expectInvalidScope(() => getScopedKvsTranslatorOrThrow(qpqConfig, 'numberStore', 'tenant-a'), InvalidScopeErrorCode.unsafeCharacters);
    expect(() => getScopedKvsTranslatorOrThrow(qpqConfig, 'missingStore', 'tenant-a')).toThrow(KvsStoreNotFoundError);
  });
});

describe('resolveScopedPkAttributeOrThrow', () => {
  it('returns the real pk attribute for a valid scope', () => {
    expect(resolveScopedPkAttributeOrThrow(qpqConfig, 'stringStore', 'tenant-a')).toBe('id');
  });

  it('rejects an invalid scope and a number-pk store', () => {
    expectInvalidScope(() => resolveScopedPkAttributeOrThrow(qpqConfig, 'stringStore', ''), InvalidScopeErrorCode.empty);
    expectInvalidScope(() => resolveScopedPkAttributeOrThrow(qpqConfig, 'numberStore', 'tenant-a'), InvalidScopeErrorCode.unsafeCharacters);
  });
});

describe('validateScopedKvsKeyOrThrow', () => {
  it('passes clean keys, scoped or unscoped', () => {
    expect(() => validateScopedKvsKeyOrThrow(qpqConfig, 'stringStore', 'tenant-a', 'item-1')).not.toThrow();
    expect(() => validateScopedKvsKeyOrThrow(qpqConfig, 'stringStore', undefined, 'item-1')).not.toThrow();
  });

  it('rejects the reserved delimiter in the raw key, scoped or unscoped', () => {
    expectInvalidScope(() => validateScopedKvsKeyOrThrow(qpqConfig, 'stringStore', 'tenant-a', 'x::y'), InvalidScopeErrorCode.reservedDelimiter);
    expectInvalidScope(
      () => validateScopedKvsKeyOrThrow(qpqConfig, 'stringStore', undefined, 'acme::secret'),
      InvalidScopeErrorCode.reservedDelimiter,
    );
  });
});

describe('validateScopedKvsItemOrThrow', () => {
  it('passes items with a clean pk value', () => {
    expect(() => validateScopedKvsItemOrThrow(qpqConfig, 'stringStore', 'tenant-a', { id: 'item-1' })).not.toThrow();
    expect(() => validateScopedKvsItemOrThrow(qpqConfig, 'stringStore', undefined, { id: 'item-1' })).not.toThrow();
  });

  it('rejects the reserved delimiter in the item pk, scoped or unscoped', () => {
    expectInvalidScope(
      () => validateScopedKvsItemOrThrow(qpqConfig, 'stringStore', 'tenant-a', { id: 'x::y' }),
      InvalidScopeErrorCode.reservedDelimiter,
    );
    expectInvalidScope(
      () => validateScopedKvsItemOrThrow(qpqConfig, 'stringStore', undefined, { id: 'acme::secret' }),
      InvalidScopeErrorCode.reservedDelimiter,
    );
  });
});

describe('validateScopedKvsKeyConditionOrThrow', () => {
  const pkEquals = (value: string) => ({ key: 'id', operation: KvsQueryOperationType.Equal, valueA: value });

  it('passes a scoped query constraining the pk and an unscoped one with clean values', () => {
    expect(() => validateScopedKvsKeyConditionOrThrow(qpqConfig, 'stringStore', 'tenant-a', pkEquals('item-1'))).not.toThrow();
    expect(() => validateScopedKvsKeyConditionOrThrow(qpqConfig, 'stringStore', undefined, pkEquals('item-1'))).not.toThrow();
  });

  it('rejects a scoped query that never constrains the pk', () => {
    const nonPkCondition = { key: 'name', operation: KvsQueryOperationType.Equal, valueA: 'x' };

    expectInvalidScope(
      () => validateScopedKvsKeyConditionOrThrow(qpqConfig, 'stringStore', 'tenant-a', nonPkCondition),
      InvalidScopeErrorCode.queryMissingPartitionKey,
    );
  });

  it('rejects the reserved delimiter in an unscoped pk comparison', () => {
    expectInvalidScope(
      () => validateScopedKvsKeyConditionOrThrow(qpqConfig, 'stringStore', undefined, pkEquals('acme::secret')),
      InvalidScopeErrorCode.reservedDelimiter,
    );
  });
});
