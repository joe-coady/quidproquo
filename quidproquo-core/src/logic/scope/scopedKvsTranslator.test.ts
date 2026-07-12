import { describe, expect, it } from 'vitest';

import { KvsLogicalOperatorType, KvsQueryOperationType } from '../../actions/keyValueStore/types';
import { createScopedKvsTranslator } from './scopedKvsTranslator';

describe('createScopedKvsTranslator (unscoped)', () => {
  it('excludes scope-composed rows from an unscoped scan', () => {
    const translator = createScopedKvsTranslator(undefined, 'id');

    expect(translator.scanFilter(undefined)).toEqual({
      key: 'id',
      operation: KvsQueryOperationType.NotContains,
      valueA: '::',
    });
  });

  it('ANDs the composed-row exclusion onto an existing unscoped scan filter', () => {
    const translator = createScopedKvsTranslator(undefined, 'id');
    const filter = { key: 'status', operation: KvsQueryOperationType.Equal, valueA: 'active' };

    expect(translator.scanFilter(filter)).toEqual({
      operation: KvsLogicalOperatorType.And,
      conditions: [{ key: 'id', operation: KvsQueryOperationType.NotContains, valueA: '::' }, filter],
    });
  });

  it('stays a pure passthrough when the partition key is unknown or non-string', () => {
    const translator = createScopedKvsTranslator(undefined, '');
    const filter = { key: 'status', operation: KvsQueryOperationType.Equal, valueA: 'active' };

    expect(translator.scanFilter(undefined)).toBeUndefined();
    expect(translator.scanFilter(filter)).toBe(filter);
  });

  it('leaves the other unscoped operations untouched', () => {
    const translator = createScopedKvsTranslator(undefined, 'id');
    const item = { id: 'a', name: 'n' };
    const condition = { key: 'id', operation: KvsQueryOperationType.Equal, valueA: 'a' };

    expect(translator.key('a')).toBe('a');
    expect(translator.item(item)).toBe(item);
    expect(translator.keyCondition(condition)).toBe(condition);
    expect(translator.filter(condition)).toBe(condition);
    expect(translator.strip(item)).toBe(item);
  });
});

describe('createScopedKvsTranslator (scoped)', () => {
  it('scopes a scan by begins-with on the pk', () => {
    const translator = createScopedKvsTranslator('tenant-a', 'id');

    expect(translator.scanFilter(undefined)).toEqual({
      key: 'id',
      operation: KvsQueryOperationType.BeginsWith,
      valueA: 'tenant-a::',
    });
  });
});
