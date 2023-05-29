import { KvsUpdateAction, KvsUpdateActionType, KvsUpdate } from 'quidproquo-core';
import { getItemName, getValueName } from './buildDynamoQuery';
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

const buildDynamoUpdateExpressionSet = (update: KvsUpdateAction): string => {
  if (!update.value) {
    throw new Error("Value must be provided for 'SET' action");
  }

  return `SET ${getNestedItemName(update.attributePath)} = ${getValueName(update.value)}`;
};

const buildDynamoUpdateExpressionRemove = (update: KvsUpdateAction): string => {
  return `REMOVE ${getNestedItemName(update.attributePath)}`;
};

const buildDynamoUpdateExpressionAdd = (update: KvsUpdateAction): string => {
  if (!update.value) {
    throw new Error("Value must be provided for 'ADD' action");
  }

  return `ADD ${getNestedItemName(update.attributePath)} ${getValueName(update.value)}`;
};

const buildDynamoUpdateExpressionDelete = (update: KvsUpdateAction): string => {
  if (update.value) {
    return `DELETE ${getNestedItemName(update.attributePath)} ${getValueName(update.value)}`;
  } else {
    return `DELETE ${getNestedItemName(update.attributePath)}`;
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

const buildDynamoUpdateExpressionRoot = (update: KvsUpdateAction): string => {
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

export const buildDynamoUpdateExpression = (updates: KvsUpdate): string => {
  return updates.map((update) => buildDynamoUpdateExpressionRoot(update)).join(', ');
};
