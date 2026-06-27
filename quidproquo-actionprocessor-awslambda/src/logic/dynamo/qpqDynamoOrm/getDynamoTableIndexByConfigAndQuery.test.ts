import { KeyValueStoreQPQConfigSetting, KvsLogicalOperatorType, KvsQueryOperationType } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { getDynamoTableIndexByConfigAndQuery } from './getDynamoTableIndexByConfigAndQuery';

const setting = {
  sortKeys: [{ key: 'createdAt', type: 'string' }],
  indexes: [{ partitionKey: { key: 'email', type: 'string' } }],
} as unknown as KeyValueStoreQPQConfigSetting;

describe('getDynamoTableIndexByConfigAndQuery', () => {
  it('prefers the primary table when the query uses the sort key', () => {
    const query = { key: 'createdAt', operation: KvsQueryOperationType.GreaterThan, valueA: 0 };

    expect(getDynamoTableIndexByConfigAndQuery(setting, query)).toBeUndefined();
  });

  it('returns the GSI partition key when the query targets it', () => {
    const query = { key: 'email', operation: KvsQueryOperationType.Equal, valueA: 'a@b.com' };

    expect(getDynamoTableIndexByConfigAndQuery(setting, query)).toBe('email');
  });

  it('finds the GSI key nested inside a logical operator', () => {
    const query = {
      operation: KvsLogicalOperatorType.And,
      conditions: [{ key: 'email', operation: KvsQueryOperationType.Equal, valueA: 'a@b.com' }],
    };

    expect(getDynamoTableIndexByConfigAndQuery(setting, query)).toBe('email');
  });

  it('returns undefined when no key matches the sort key or a GSI', () => {
    const query = { key: 'name', operation: KvsQueryOperationType.Equal, valueA: 'x' };

    expect(getDynamoTableIndexByConfigAndQuery(setting, query)).toBeUndefined();
  });
});
