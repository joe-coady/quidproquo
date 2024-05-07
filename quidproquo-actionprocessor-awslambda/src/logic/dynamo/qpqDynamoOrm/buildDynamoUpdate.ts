import { AttributeValue } from '@aws-sdk/client-dynamodb';

import { KvsUpdateAction, KvsUpdateActionType, KvsUpdate } from 'quidproquo-core';
import { getItemName, getValueName, buildAttributeValue } from './buildDynamoQuery';
import { KvsAttributePath } from 'quidproquo-core';

interface ExpressionAttributeNameMap {
  [key: string]: string;
}

export const buildUpdateExpressionAttributeNames = (
  updates: KvsUpdate,
): ExpressionAttributeNameMap => {
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

export const buildUpdateExpressionAttributeValues = (
  updates: KvsUpdate,
): { [key: string]: AttributeValue } | undefined => {
  let attributeValues: { [key: string]: AttributeValue } = {};

  for (let update of updates) {
    if (update.value !== undefined) {
      const valuePlaceholder = getValueName(update.value);
      attributeValues[valuePlaceholder] = buildAttributeValue(update.value);
    }
  }

  return Object.keys(attributeValues).length > 0 ? attributeValues : undefined;
};

const buildDynamoUpdateExpressionSet = (update: KvsUpdateAction): string => {
  if (!update.value) {
    throw new Error("Value must be provided for 'SET' action");
  }

  return `${getNestedItemName(update.attributePath)} = ${getValueName(update.value)}`;
};

const buildDynamoUpdateExpressionRemove = (update: KvsUpdateAction): string => {
  return `${getNestedItemName(update.attributePath)}`;
};

const buildDynamoUpdateExpressionAdd = (update: KvsUpdateAction): string => {
  if (!update.value) {
    throw new Error("Value must be provided for 'ADD' action");
  }

  return `${getNestedItemName(update.attributePath)} ${getValueName(update.value)}`;
};

const buildDynamoUpdateExpressionDelete = (update: KvsUpdateAction): string => {
  if (update.value) {
    return `${getNestedItemName(update.attributePath)} ${getValueName(update.value)}`;
  } else {
    return `${getNestedItemName(update.attributePath)}`;
  }
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
    default:
      throw new Error(`Invalid update action type: ${update.action}`);
  }
};

export const buildDynamoUpdateExpressionForType = (
  type: KvsUpdateActionType,
  kvsUpdate: KvsUpdate,
): string => {
  const actions = kvsUpdate.filter((update) => update.action === type);

  // If there are no actions of this type, return an empty string
  if (actions.length === 0) {
    return '';
  }

  const expressions = actions
    .map((update, index) => buildDynamoUpdateExpressionPart(update, index))
    .join(', ');

  switch (type) {
    case KvsUpdateActionType.Set:
      return `SET ${expressions}`;
    case KvsUpdateActionType.Remove:
      return `REMOVE ${expressions}`;
    case KvsUpdateActionType.Add:
      return `ADD ${expressions}`;
    case KvsUpdateActionType.Delete:
      return `DELETE ${expressions}`;
    default:
      throw new Error(`Invalid update action type: ${type}`);
  }
};

export const buildDynamoUpdateExpression = (updates: KvsUpdate): string => {
  const updatesExpressions = [
    KvsUpdateActionType.Set,
    KvsUpdateActionType.Remove,
    KvsUpdateActionType.Add,
    KvsUpdateActionType.Delete,
  ]
    .map((kvsUpdateActionType) => buildDynamoUpdateExpressionForType(kvsUpdateActionType, updates))
    .filter((expression) => !!expression);

  const result = updatesExpressions.join(' ');
  console.log('Update Expression: ', result);

  return result;
};
