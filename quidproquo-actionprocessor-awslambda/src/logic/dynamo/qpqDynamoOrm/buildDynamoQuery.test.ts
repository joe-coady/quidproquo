import { KvsLogicalOperatorType, KvsQueryCondition, KvsQueryOperation, KvsQueryOperationType } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import {
  buildAttributeValue,
  buildDynamoQueryExpression,
  buildExpressionAttributeNames,
  buildExpressionAttributeValues,
  getItemName,
  getValueName,
  isKvsLogicalOperator,
  isKvsQueryCondition,
} from './buildDynamoQuery';

const condition = (overrides: Partial<KvsQueryCondition>): KvsQueryCondition => ({
  key: 'age',
  operation: KvsQueryOperationType.Equal,
  ...overrides,
});

describe('getItemName / getValueName', () => {
  it('prefixes hashed names with # and : respectively', () => {
    expect(getItemName('age')).toMatch(/^#[0-9a-f]+$/);
    expect(getValueName(30)).toMatch(/^:[0-9a-f]+$/);
  });

  it('is deterministic and distinguishes distinct inputs', () => {
    expect(getItemName('age')).toBe(getItemName('age'));
    expect(getItemName('age')).not.toBe(getItemName('name'));
    expect(getValueName(1)).not.toBe(getValueName(2));
  });
});

describe('buildAttributeValue', () => {
  it('maps scalars to dynamo attribute values', () => {
    expect(buildAttributeValue('hi')).toEqual({ S: 'hi' });
    expect(buildAttributeValue(30)).toEqual({ N: '30' });
    expect(buildAttributeValue(true)).toEqual({ BOOL: true });
    expect(buildAttributeValue(null as any)).toEqual({ NULL: true });
  });

  it('maps arrays to lists and objects to maps, dropping undefined members', () => {
    expect(buildAttributeValue(['a', 1])).toEqual({ L: [{ S: 'a' }, { N: '1' }] });
    expect(buildAttributeValue({ a: 'x', b: undefined } as any)).toEqual({ M: { a: { S: 'x' } } });
  });

  it('throws for an unsupported data type', () => {
    expect(() => buildAttributeValue(undefined as any)).toThrow('Unsupported data type in kvs expression: undefined');
  });
});

describe('isKvsQueryCondition / isKvsLogicalOperator', () => {
  it('discriminates conditions from logical operators', () => {
    const cond = condition({});
    const logical: KvsQueryOperation = { operation: KvsLogicalOperatorType.And, conditions: [cond] };

    expect(isKvsQueryCondition(cond)).toBe(true);
    expect(isKvsQueryCondition(logical)).toBe(false);
    expect(isKvsLogicalOperator(logical)).toBe(true);
    expect(isKvsLogicalOperator(cond)).toBe(false);
  });
});

describe('buildDynamoQueryExpression', () => {
  it('returns undefined when no query is given', () => {
    expect(buildDynamoQueryExpression()).toBeUndefined();
  });

  it.each([
    [KvsQueryOperationType.Equal, '='],
    [KvsQueryOperationType.NotEqual, '<>'],
    [KvsQueryOperationType.LessThan, '<'],
    [KvsQueryOperationType.LessThanOrEqual, '<='],
    [KvsQueryOperationType.GreaterThan, '>'],
    [KvsQueryOperationType.GreaterThanOrEqual, '>='],
  ])('renders %s as a binary comparison', (operation: KvsQueryOperationType, symbol: string) => {
    expect(buildDynamoQueryExpression(condition({ operation, valueA: 5 }))).toBe(`${getItemName('age')} ${symbol} ${getValueName(5)}`);
  });

  it('renders BETWEEN with both bounds', () => {
    const query = condition({ operation: KvsQueryOperationType.Between, valueA: 1, valueB: 9 });

    expect(buildDynamoQueryExpression(query)).toBe(`${getItemName('age')} BETWEEN ${getValueName(1)} AND ${getValueName(9)}`);
  });

  it('renders IN over each value', () => {
    const query = condition({ operation: KvsQueryOperationType.In, valueA: ['a', 'b'] });

    expect(buildDynamoQueryExpression(query)).toBe(`${getItemName('age')} IN (${getValueName('a')}, ${getValueName('b')})`);
  });

  it.each([
    [KvsQueryOperationType.Exists, `attribute_exists(${getItemName('age')})`],
    [KvsQueryOperationType.NotExists, `attribute_not_exists(${getItemName('age')})`],
  ])('renders %s as a function', (operation: KvsQueryOperationType, expected: string) => {
    expect(buildDynamoQueryExpression(condition({ operation }))).toBe(expected);
  });

  it.each([
    [KvsQueryOperationType.BeginsWith, `begins_with(${getItemName('age')}, ${getValueName('a')})`],
    [KvsQueryOperationType.Contains, `contains(${getItemName('age')}, ${getValueName('a')})`],
    [KvsQueryOperationType.NotContains, `NOT contains(${getItemName('age')}, ${getValueName('a')})`],
  ])('renders %s', (operation: KvsQueryOperationType, expected: string) => {
    expect(buildDynamoQueryExpression(condition({ operation, valueA: 'a' }))).toBe(expected);
  });

  it('joins AND / OR conditions with parentheses', () => {
    const a = condition({ key: 'age', valueA: 1 });
    const b = condition({ key: 'name', valueA: 'x' });

    expect(buildDynamoQueryExpression({ operation: KvsLogicalOperatorType.And, conditions: [a, b] })).toBe(
      `(${getItemName('age')} = ${getValueName(1)}) AND (${getItemName('name')} = ${getValueName('x')})`,
    );
    expect(buildDynamoQueryExpression({ operation: KvsLogicalOperatorType.Or, conditions: [a, b] })).toBe(
      `(${getItemName('age')} = ${getValueName(1)}) OR (${getItemName('name')} = ${getValueName('x')})`,
    );
  });
});

describe('buildExpressionAttributeValues', () => {
  it('collects valueA and valueB placeholders, skipping undefined queries', () => {
    const query = condition({ operation: KvsQueryOperationType.Between, valueA: 1, valueB: 9 });

    expect(buildExpressionAttributeValues([query, undefined])).toEqual({
      [getValueName(1)]: { N: '1' },
      [getValueName(9)]: { N: '9' },
    });
  });

  it('returns undefined when there are no values', () => {
    expect(buildExpressionAttributeValues([condition({ operation: KvsQueryOperationType.Exists, valueA: undefined })])).toBeUndefined();
  });
});

describe('buildExpressionAttributeNames', () => {
  it('maps each item placeholder back to its key, recursing into logical operators', () => {
    const query: KvsQueryOperation = {
      operation: KvsLogicalOperatorType.And,
      conditions: [condition({ key: 'age', valueA: 1 }), condition({ key: 'name', valueA: 'x' })],
    };

    expect(buildExpressionAttributeNames([query])).toEqual({
      [getItemName('age')]: 'age',
      [getItemName('name')]: 'name',
    });
  });

  it('returns undefined when there are no names', () => {
    expect(buildExpressionAttributeNames([undefined])).toBeUndefined();
  });
});
