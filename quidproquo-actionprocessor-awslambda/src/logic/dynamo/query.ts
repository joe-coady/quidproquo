import { DynamoDBClient, QueryCommand, QueryCommandInput } from '@aws-sdk/client-dynamodb';

import { KvsQueryOperation, QpqPagedData } from 'quidproquo-core';
import { convertDynamoMapToObject } from './convertObjectToDynamoMap';
import { stringToLastEvaluatedKey } from './logs';
import { itemsToQpqPagedData } from './utils/itemsToQpqPagedData';

import {
  buildExpressionAttributeValues,
  buildExpressionAttributeNames,
  buildDynamoQueryExpression,
} from './qpqDynamoOrm';

export async function query<Item>(
  tableName: string,
  region: string,
  keyExpression: KvsQueryOperation,
  filterExpression?: KvsQueryOperation,
  pageKey?: string,
  indexName?: string,
): Promise<QpqPagedData<Item>> {
  // Instantiate DynamoDB client
  const dynamoClient = new DynamoDBClient({ region });

  const params: QueryCommandInput = {
    TableName: tableName,
    KeyConditionExpression: buildDynamoQueryExpression(keyExpression),
    FilterExpression: filterExpression && buildDynamoQueryExpression(filterExpression),
    ExpressionAttributeValues: buildExpressionAttributeValues([keyExpression, filterExpression]),
    ExpressionAttributeNames: buildExpressionAttributeNames([keyExpression, filterExpression]),
    IndexName: indexName,
  };

  if (pageKey) {
    params.ExclusiveStartKey = stringToLastEvaluatedKey(pageKey);
  }

  // Create QueryCommand
  const command = new QueryCommand(params);

  // TODO: Catch errors and throw QPQ ones
  const data = await dynamoClient.send(command);

  return itemsToQpqPagedData<Item>(
    (data.Items?.map((i) => convertDynamoMapToObject(i)) || []) as Item[],
    data.LastEvaluatedKey,
  );
}
