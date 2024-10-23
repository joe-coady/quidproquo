import { KvsQueryOperation, QpqPagedData } from 'quidproquo-core';

import { DynamoDBClient, QueryCommand, QueryCommandInput } from '@aws-sdk/client-dynamodb';

import { createAwsClient } from '../createAwsClient';
import { itemsToQpqPagedData } from './utils/itemsToQpqPagedData';
import { convertDynamoMapToObject } from './convertObjectToDynamoMap';
import { stringToLastEvaluatedKey } from './logs';
import { buildDynamoQueryExpression,buildExpressionAttributeNames, buildExpressionAttributeValues } from './qpqDynamoOrm';

export async function query<Item>(
  tableName: string,
  region: string,
  keyExpression: KvsQueryOperation,
  filterExpression?: KvsQueryOperation,
  pageKey?: string,
  indexName?: string,
  limit?: number,
  sortAscending?: boolean,
): Promise<QpqPagedData<Item>> {
  // Instantiate DynamoDB client
  const dynamoDBClient = createAwsClient(DynamoDBClient, { region });

  const params: QueryCommandInput = {
    TableName: tableName,
    KeyConditionExpression: buildDynamoQueryExpression(keyExpression),
    FilterExpression: filterExpression && buildDynamoQueryExpression(filterExpression),
    ExpressionAttributeValues: buildExpressionAttributeValues([keyExpression, filterExpression]),
    ExpressionAttributeNames: buildExpressionAttributeNames([keyExpression, filterExpression]),
    IndexName: indexName,
    Limit: limit,
    ScanIndexForward: sortAscending,
  };

  if (pageKey) {
    params.ExclusiveStartKey = stringToLastEvaluatedKey(pageKey);
  }

  // Create QueryCommand
  const command = new QueryCommand(params);

  // TODO: Catch errors and throw QPQ ones
  const data = await dynamoDBClient.send(command);

  return itemsToQpqPagedData<Item>((data.Items?.map((i) => convertDynamoMapToObject(i)) || []) as Item[], data.LastEvaluatedKey);
}
