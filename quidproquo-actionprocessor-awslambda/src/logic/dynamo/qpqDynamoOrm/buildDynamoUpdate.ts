import { KvsUpdate, KvsUpdateAction, KvsUpdateActionType } from 'quidproquo-core';
import { KvsAttributePath } from 'quidproquo-core';

import { AttributeValue } from '@aws-sdk/client-dynamodb';

import { buildAttributeValue, getItemName, getValueName } from './buildDynamoQuery';

interface ExpressionAttributeNameMap {
  [key: string]: string;
}

export const buildUpdateExpressionAttributeNames = (updates: KvsUpdate): ExpressionAttributeNameMap => {
  let attributeNames: ExpressionAttributeNameMap = {};

  for (let update of updates) {
    if (Array.isArray(update.attributePath)) {
      // Handle nested attributes
      for (let i = 0; i < update.attributePath.length; i++) {
        let attribute = update.attributePath[i];
        if (typeof attribute === 'string') {
          const itemName = getItemName(attribute);
          attributeNames[itemName] = attribute;
          // Replace attribute name in path with safe name
          update.attributePath[i] = itemName;
        }
      }
    } else {
      // Handle top-level attributes
      const itemName = getItemName(update.attributePath);
      attributeNames[itemName] = update.attributePath;
      update.attributePath = itemName;
    }
  }

  return attributeNames;
};

export const buildUpdateExpressionAttributeValues = (updates: KvsUpdate): { [key: string]: AttributeValue } | undefined => {
  let attributeValues: { [key: string]: AttributeValue } = {};

  for (let update of updates) {
    if (update.value !== undefined && update.value !== null) {
      const valuePlaceholder = getValueName(update.value);
      attributeValues[valuePlaceholder] = buildAttributeValue(update.value);
    }
    // Include defaultValue for Increment actions
    if (update.defaultValue !== undefined && update.defaultValue !== null) {
      const defaultPlaceholder = getValueName(update.defaultValue);
      attributeValues[defaultPlaceholder] = buildAttributeValue(update.defaultValue);
    }
  }

  return Object.keys(attributeValues).length > 0 ? attributeValues : undefined;
};

const buildDynamoUpdateExpressionSet = (update: KvsUpdateAction): string => {
  if (update.value === undefined || update.value === null) {
    throw new Error("Value must be provided for 'SET' action");
  }

  return `${getNestedItemName(update.attributePath)} = ${getValueName(update.value)}`;
};

const buildDynamoUpdateExpressionRemove = (update: KvsUpdateAction): string => {
  return `${getNestedItemName(update.attributePath)}`;
};

const buildDynamoUpdateExpressionAdd = (update: KvsUpdateAction): string => {
  if (update.value === undefined || update.value === null) {
    throw new Error("Value must be provided for 'ADD' action");
  }

  return `${getNestedItemName(update.attributePath)} ${getValueName(update.value)}`;
};

const buildDynamoUpdateExpressionDelete = (update: KvsUpdateAction): string => {
  if (update.value !== undefined && update.value !== null) {
    return `${getNestedItemName(update.attributePath)} ${getValueName(update.value)}`;
  } else {
    return `${getNestedItemName(update.attributePath)}`;
  }
};

const buildDynamoUpdateExpressionSetIfNotExists = (update: KvsUpdateAction): string => {
  if (update.value === undefined || update.value === null) {
    throw new Error("Value must be provided for 'SetIfNotExists' action");
  }

  const attrPath = getNestedItemName(update.attributePath);
  return `${attrPath} = if_not_exists(${attrPath}, ${getValueName(update.value)})`;
};

const buildDynamoUpdateExpressionIncrement = (update: KvsUpdateAction): string => {
  if (update.value === undefined || update.value === null) {
    throw new Error("Increment value must be provided for 'Increment' action");
  }
  if (update.defaultValue === undefined || update.defaultValue === null) {
    throw new Error("Default value must be provided for 'Increment' action");
  }

  const attrPath = getNestedItemName(update.attributePath);
  return `${attrPath} = if_not_exists(${attrPath}, ${getValueName(update.defaultValue)}) + ${getValueName(update.value)}`;
};

const getNestedItemName = (attributePath: KvsAttributePath): string => {
  if (Array.isArray(attributePath)) {
    let path = '';
    for (let i = 0; i < attributePath.length; i++) {
      if (typeof attributePath[i] === 'string') {
        path += `.${getItemName(attributePath[i] as string)}`;
      } else {
        path += `[${attributePath[i]}]`;
      }
    }
    return path.substring(1); // remove the leading dot
  } else {
    return getItemName(attributePath);
  }
};

const buildDynamoUpdateExpressionPart = (update: KvsUpdateAction, updateIndex: number): string => {
  switch (update.action) {
    case KvsUpdateActionType.Set:
      return buildDynamoUpdateExpressionSet(update);
    case KvsUpdateActionType.Remove:
      return buildDynamoUpdateExpressionRemove(update);
    case KvsUpdateActionType.Add:
      return buildDynamoUpdateExpressionAdd(update);
    case KvsUpdateActionType.Delete:
      return buildDynamoUpdateExpressionDelete(update);
    case KvsUpdateActionType.SetIfNotExists:
      return buildDynamoUpdateExpressionSetIfNotExists(update);
    case KvsUpdateActionType.Increment:
      return buildDynamoUpdateExpressionIncrement(update);
    default:
      throw new Error(`Invalid update action type: ${update.action}`);
  }
};

// Types that generate SET expressions
const SET_ACTION_TYPES = [
  KvsUpdateActionType.Set,
  KvsUpdateActionType.SetIfNotExists,
  KvsUpdateActionType.Increment
];

const buildDynamoUpdateExpressionForClause = (
  clause: 'SET' | 'REMOVE' | 'ADD' | 'DELETE',
  actionTypes: KvsUpdateActionType[],
  kvsUpdate: KvsUpdate,
): string => {
  const actions = kvsUpdate.filter((update) => actionTypes.includes(update.action));

  if (actions.length === 0) {
    return '';
  }

  const expressions = actions.map((update, index) => buildDynamoUpdateExpressionPart(update, index)).join(', ');
  return `${clause} ${expressions}`;
};

export const buildDynamoUpdateExpression = (updates: KvsUpdate): string => {
  const clauses = [
    buildDynamoUpdateExpressionForClause('SET', SET_ACTION_TYPES, updates),
    buildDynamoUpdateExpressionForClause('REMOVE', [KvsUpdateActionType.Remove], updates),
    buildDynamoUpdateExpressionForClause('ADD', [KvsUpdateActionType.Add], updates),
    buildDynamoUpdateExpressionForClause('DELETE', [KvsUpdateActionType.Delete], updates),
  ].filter((expression) => !!expression);

  const result = clauses.join(' ');
  console.log('Update Expression: ', result);

  return result;
};
