import { KvsUpdate, KvsUpdateActionType } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { getItemName, getValueName } from './buildDynamoQuery';
import { buildDynamoUpdateExpression, buildUpdateExpressionAttributeNames, buildUpdateExpressionAttributeValues } from './buildDynamoUpdate';

describe('buildDynamoUpdateExpression', () => {
  it('builds a SET clause for Set actions', () => {
    const updates: KvsUpdate = [{ attributePath: 'name', action: KvsUpdateActionType.Set, value: 'Ada' }];

    expect(buildDynamoUpdateExpression(updates)).toBe(`SET ${getItemName('name')} = ${getValueName('Ada')}`);
  });

  it('builds a SET clause with if_not_exists for SetIfNotExists', () => {
    const updates: KvsUpdate = [{ attributePath: 'name', action: KvsUpdateActionType.SetIfNotExists, value: 'Ada' }];
    const name = getItemName('name');

    expect(buildDynamoUpdateExpression(updates)).toBe(`SET ${name} = if_not_exists(${name}, ${getValueName('Ada')})`);
  });

  it('builds an Increment as if_not_exists plus the increment value', () => {
    const updates: KvsUpdate = [{ attributePath: 'count', action: KvsUpdateActionType.Increment, value: 1, defaultValue: 0 }];
    const count = getItemName('count');

    expect(buildDynamoUpdateExpression(updates)).toBe(`SET ${count} = if_not_exists(${count}, ${getValueName(0)}) + ${getValueName(1)}`);
  });

  it('builds REMOVE, ADD and DELETE clauses', () => {
    expect(buildDynamoUpdateExpression([{ attributePath: 'old', action: KvsUpdateActionType.Remove }])).toBe(`REMOVE ${getItemName('old')}`);
    expect(buildDynamoUpdateExpression([{ attributePath: 'tags', action: KvsUpdateActionType.Add, value: 'x' }])).toBe(
      `ADD ${getItemName('tags')} ${getValueName('x')}`,
    );
    expect(buildDynamoUpdateExpression([{ attributePath: 'tags', action: KvsUpdateActionType.Delete, value: 'x' }])).toBe(
      `DELETE ${getItemName('tags')} ${getValueName('x')}`,
    );
  });

  it('resolves a nested attribute path with array indexes', () => {
    const updates: KvsUpdate = [{ attributePath: ['items', 0], action: KvsUpdateActionType.Set, value: 'x' }];

    expect(buildDynamoUpdateExpression(updates)).toBe(`SET ${getItemName('items')}[0] = ${getValueName('x')}`);
  });

  it('combines clauses across action types', () => {
    const updates: KvsUpdate = [
      { attributePath: 'name', action: KvsUpdateActionType.Set, value: 'Ada' },
      { attributePath: 'old', action: KvsUpdateActionType.Remove },
    ];

    expect(buildDynamoUpdateExpression(updates)).toBe(`SET ${getItemName('name')} = ${getValueName('Ada')} REMOVE ${getItemName('old')}`);
  });

  it('throws when a Set action has no value', () => {
    expect(() => buildDynamoUpdateExpression([{ attributePath: 'name', action: KvsUpdateActionType.Set }])).toThrow(
      "Value must be provided for 'SET' action",
    );
  });

  it('throws when an Increment action has no default value', () => {
    expect(() => buildDynamoUpdateExpression([{ attributePath: 'count', action: KvsUpdateActionType.Increment, value: 1 }])).toThrow(
      "Default value must be provided for 'Increment' action",
    );
  });
});

describe('buildUpdateExpressionAttributeValues', () => {
  it('collects value and defaultValue placeholders', () => {
    const updates: KvsUpdate = [{ attributePath: 'count', action: KvsUpdateActionType.Increment, value: 1, defaultValue: 0 }];

    expect(buildUpdateExpressionAttributeValues(updates)).toEqual({
      [getValueName(1)]: { N: '1' },
      [getValueName(0)]: { N: '0' },
    });
  });

  it('returns undefined when no updates carry a value', () => {
    expect(buildUpdateExpressionAttributeValues([{ attributePath: 'old', action: KvsUpdateActionType.Remove }])).toBeUndefined();
  });
});

describe('buildUpdateExpressionAttributeNames', () => {
  it('maps a top-level attribute placeholder to its name', () => {
    expect(buildUpdateExpressionAttributeNames([{ attributePath: 'name', action: KvsUpdateActionType.Set, value: 'x' }])).toEqual({
      [getItemName('name')]: 'name',
    });
  });

  it('maps each segment of a nested attribute path', () => {
    expect(buildUpdateExpressionAttributeNames([{ attributePath: ['a', 'b'], action: KvsUpdateActionType.Set, value: 'x' }])).toEqual({
      [getItemName('a')]: 'a',
      [getItemName('b')]: 'b',
    });
  });
});
