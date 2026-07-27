import { KvsKey, KvsObjectDataType } from 'quidproquo-core';

import { AttributeValue, DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

import { createAwsClient } from '../createAwsClient';
import { buildAttributeValue } from './qpqDynamoOrm';

export type PutItemOptions = {
  // Requested TTL in seconds. Not currently applied: the table's ttlAttribute
  // name is not plumbed through to this call, so the value is silently
  // dropped. Wire storeConfig.ttlAttribute through and write the epoch expiry
  // before relying on it.
  expires?: number;

  // When set, the put becomes a conditional insert: it fails with
  // ConditionalCheckFailedException if an item with the same primary key
  // already exists. The value is the attribute name to condition on (any
  // key attribute works: the condition evaluates against the item at the
  // full primary key).
  ifNotExistsAttribute?: string;
};

// Root items must be objects. A root-level list is technically storable, but
// DynamoDB cannot conditionally update or delete individual list elements,
// and a root list is usually better modelled as its own table.
const convertObjectToDynamoItem = (obj: KvsObjectDataType): Record<string, AttributeValue> => {
  return buildAttributeValue(obj).M!;
};

export async function putItem(
  tableName: string,
  item: KvsObjectDataType,
  attributes: KvsKey[],
  options: PutItemOptions,
  region: string,
): Promise<void> {
  const dynamoDBClient = createAwsClient(DynamoDBClient, { region });

  await dynamoDBClient.send(
    new PutItemCommand({
      TableName: tableName,
      Item: convertObjectToDynamoItem(item),
      ...(options.ifNotExistsAttribute
        ? {
            ConditionExpression: 'attribute_not_exists(#ineAttr)',
            ExpressionAttributeNames: { '#ineAttr': options.ifNotExistsAttribute },
          }
        : {}),
    }),
  );
}
