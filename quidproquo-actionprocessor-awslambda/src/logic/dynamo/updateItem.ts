import { KvsCoreDataType, KvsUpdate } from 'quidproquo-core';

import { DynamoDBClient, ReturnValue, UpdateItemCommand } from '@aws-sdk/client-dynamodb';

import { createAwsClient } from '../createAwsClient';
import { buildDynamoKey } from './utils/buildDynamoKey';
import { convertDynamoMapToObject } from './convertDynamoMapToObject';
import { buildDynamoUpdateExpression, buildUpdateExpressionAttributeNames, buildUpdateExpressionAttributeValues } from './qpqDynamoOrm';

/** Apply a kvs update to one item and return the full item as stored after the update. */
export async function updateItem<Item>(
  tableName: string,
  region: string,
  update: KvsUpdate,
  keyName: string,
  key: KvsCoreDataType,
  sortKeyName?: string,
  sortKey?: KvsCoreDataType,
): Promise<Item> {
  const dynamoDBClient = createAwsClient(DynamoDBClient, { region });

  const result = await dynamoDBClient.send(
    new UpdateItemCommand({
      TableName: tableName,
      Key: buildDynamoKey(keyName, key, sortKeyName, sortKey),
      UpdateExpression: buildDynamoUpdateExpression(update),
      ExpressionAttributeValues: buildUpdateExpressionAttributeValues(update),
      ExpressionAttributeNames: buildUpdateExpressionAttributeNames(update),
      ReturnValues: ReturnValue.ALL_NEW,
    }),
  );

  return convertDynamoMapToObject(result.Attributes) as Item;
}
