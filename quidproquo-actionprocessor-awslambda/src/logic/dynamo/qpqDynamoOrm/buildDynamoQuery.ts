import crypto from 'crypto';

import {
  KvsQueryOperation,
  KvsQueryOperationType,
  KvsQueryCondition,
  KvsLogicalOperator,
  KvsLogicalOperatorType,
  KvsAdvancedDataType,
} from 'quidproquo-core';

import { AttributeValue } from '@aws-sdk/client-dynamodb';

// TODO: Come up with a better way of generating item name / values
// probably a map ~ however this will most likely never fail.

const getHash = (name: string): string => {
  const c = crypto.createHash('md5').update(name).digest('hex');

  return c;
};

export const getItemName = (name: string) => {
  return `#${getHash(name)}`;
};

export const getValueName = (value: KvsAdvancedDataType) => {
  return `:${getHash(`${typeof value}-${JSON.stringify(value)}`)}`;
};

const buildDynamoQueryExpressionBetween = (query: KvsQueryCondition): string => {
  if (!query.key || !query.valueB || !query.valueB) {
    throw new Error(`Invalid query condition ${KvsQueryOperationType.Between}`);
  }

  return `${getItemName(query.key)} BETWEEN ${getValueName(
    query.valueA as string,
  )} AND ${getValueName(query.valueB as string)}`;
};

const buildDynamoQueryExpressionEqual = (query: KvsQueryCondition): string => {
  return `${getItemName(query.key)} = ${getValueName(query.valueA as string)}`;
};

const buildDynamoQueryExpressionNotEqual = (query: KvsQueryCondition): string => {
  return `${getItemName(query.key)} <> ${getValueName(query.valueA as string)}`;
};

const buildDynamoQueryExpressionLessThan = (query: KvsQueryCondition): string => {
  return `${getItemName(query.key)} < ${getValueName(query.valueA as string)}`;
};

const buildDynamoQueryExpressionLessThanOrEqual = (query: KvsQueryCondition): string => {
  return `${getItemName(query.key)} <= ${getValueName(query.valueA as string)}`;
};

const buildDynamoQueryExpressionGreaterThan = (query: KvsQueryCondition): string => {
  return `${getItemName(query.key)} > ${getValueName(query.valueA as string)}`;
};

const buildDynamoQueryExpressionGreaterThanOrEqual = (query: KvsQueryCondition): string => {
  return `${getItemName(query.key)} >= ${getValueName(query.valueA as string)}`;
};

const buildDynamoQueryExpressionIn = (query: KvsQueryCondition): string => {
  return `${getItemName(query.key)} IN (${(query.valueA as string[])
    .map((v) => getValueName(v))
    .join(', ')})`;
};

const buildDynamoQueryExpressionExists = (query: KvsQueryCondition): string => {
  return `attribute_exists(${getItemName(query.key)})`;
};

const buildDynamoQueryExpressionNotExists = (query: KvsQueryCondition): string => {
  return `attribute_not_exists(${getItemName(query.key)})`;
};

const buildDynamoQueryExpressionBeginsWith = (query: KvsQueryCondition): string => {
  return `begins_with(${getItemName(query.key)}, ${getValueName(query.valueA as string)})`;
};

const buildDynamoQueryExpressionContains = (query: KvsQueryCondition): string => {
  return `contains(${getItemName(query.key)}, ${getValueName(query.valueA as string)})`;
};

const buildDynamoQueryExpressionNotContains = (query: KvsQueryCondition): string => {
  return `NOT contains(${getItemName(query.key)}, ${getValueName(query.valueA as string)})`;
};

const buildDynamoQueryExpressionOr = (query: KvsLogicalOperator): string => {
  return query.conditions.map((c) => `(${buildDynamoQueryExpressionRoot(c)})`).join(' OR ');
};

const buildDynamoQueryExpressionAnd = (query: KvsLogicalOperator): string => {
  return query.conditions.map((c) => `(${buildDynamoQueryExpressionRoot(c)})`).join(' AND ');
};

export const isKvsQueryCondition = (query: KvsQueryOperation): query is KvsQueryCondition => {
  return 'key' in query && 'operation' in query;
};

export const isKvsLogicalOperator = (query: KvsQueryOperation): query is KvsLogicalOperator => {
  return 'conditions' in query && 'operation' in query;
};

const buildDynamoQueryExpressionRoot = (query: KvsQueryOperation): string => {
  if (isKvsQueryCondition(query)) {
    switch (query.operation) {
      case KvsQueryOperationType.Equal:
        return buildDynamoQueryExpressionEqual(query);
      case KvsQueryOperationType.NotEqual:
        return buildDynamoQueryExpressionNotEqual(query);
      case KvsQueryOperationType.LessThan:
        return buildDynamoQueryExpressionLessThan(query);
      case KvsQueryOperationType.LessThanOrEqual:
        return buildDynamoQueryExpressionLessThanOrEqual(query);
      case KvsQueryOperationType.GreaterThan:
        return buildDynamoQueryExpressionGreaterThan(query);
      case KvsQueryOperationType.GreaterThanOrEqual:
        return buildDynamoQueryExpressionGreaterThanOrEqual(query);
      case KvsQueryOperationType.Between:
        return buildDynamoQueryExpressionBetween(query);
      case KvsQueryOperationType.In:
        return buildDynamoQueryExpressionIn(query);
      case KvsQueryOperationType.Exists:
        return buildDynamoQueryExpressionExists(query);
      case KvsQueryOperationType.NotExists:
        return buildDynamoQueryExpressionNotExists(query);
      case KvsQueryOperationType.BeginsWith:
        return buildDynamoQueryExpressionBeginsWith(query);
      case KvsQueryOperationType.Contains:
        return buildDynamoQueryExpressionContains(query);
      case KvsQueryOperationType.NotContains:
        return buildDynamoQueryExpressionNotContains(query);
    }
  } else if (isKvsLogicalOperator(query)) {
    switch (query.operation) {
      case KvsLogicalOperatorType.And:
        return buildDynamoQueryExpressionAnd(query);
      case KvsLogicalOperatorType.Or:
        return buildDynamoQueryExpressionOr(query);
    }
  }

  throw new Error(`Invalid query operation: ${JSON.stringify(query)}`);
};

export const buildAttributeValue = (value: KvsAdvancedDataType): AttributeValue => {
  const valueType = typeof value;
  switch (valueType) {
    case 'string':
      return { S: value as string };

    case 'number':
      return { N: (value as number).toString() };

    case 'boolean':
      return { BOOL: value as boolean };

    case 'object':
      if (Array.isArray(value)) {
        return {
          L: value.map((item) => buildAttributeValue(item)),
        };
      } else if (value !== null) {
        return {
          M: Object.fromEntries(Object.entries(value).map(([k, v]) => [k, buildAttributeValue(v)])),
        };
      } else {
        return { NULL: true };
      }
    default:
      throw new Error(`Unsupported data type: ${valueType}`);
  }
};

export const buildDynamoQueryExpression = (query?: KvsQueryOperation): string | undefined => {
  if (!query) {
    return undefined;
  }

  return buildDynamoQueryExpressionRoot(query);
};

export const buildExpressionAttributeValues = (
  queries: (KvsQueryOperation | undefined)[],
): Record<string, AttributeValue> => {
  const values: Record<string, AttributeValue> = {};

  const traverse = (query: KvsQueryOperation) => {
    if (isKvsQueryCondition(query)) {
      if (query.valueA !== undefined) {
        const valueNameA = getValueName(query.valueA);
        values[valueNameA] = buildAttributeValue(query.valueA);
      }

      if (query.valueB !== undefined) {
        const valueNameB = getValueName(query.valueB);
        values[valueNameB] = buildAttributeValue(query.valueB);
      }
    } else if (isKvsLogicalOperator(query)) {
      for (const condition of query.conditions) {
        traverse(condition);
      }
    }
  };

  queries.filter((q) => !!q).forEach((q) => traverse(q!));

  return values;
};

export const buildExpressionAttributeNames = (
  queries: (KvsQueryOperation | undefined)[],
): Record<string, string> => {
  const names: Record<string, string> = {};

  const traverse = (query: KvsQueryOperation) => {
    if (isKvsQueryCondition(query)) {
      const itemName = getItemName(query.key);
      names[itemName] = query.key;
    } else if (isKvsLogicalOperator(query)) {
      for (const condition of query.conditions) {
        traverse(condition);
      }
    }
  };

  queries.filter((q) => !!q).forEach((q) => traverse(q!));

  return names;
};
