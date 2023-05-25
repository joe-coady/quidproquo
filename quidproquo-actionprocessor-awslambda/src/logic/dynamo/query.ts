import { DynamoDBClient, QueryCommand, QueryCommandInput } from '@aws-sdk/client-dynamodb';

import { KvsQueryOperation } from 'quidproquo-core';
import { convertDynamoMapToObject } from './convertObjectToDynamoMap';

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
  indexName?: string,
): Promise<Item[]> {
  // Instantiate DynamoDB client
  const dynamoClient = new DynamoDBClient({ region });

  const params: QueryCommandInput = {
    TableName: tableName,
    KeyConditionExpression: buildDynamoQueryExpression(keyExpression),
    FilterExpression: buildDynamoQueryExpression(filterExpression),
    ExpressionAttributeValues: buildExpressionAttributeValues([keyExpression, filterExpression]),
    ExpressionAttributeNames: buildExpressionAttributeNames([keyExpression, filterExpression]),
    IndexName: indexName,
  };

  // TODO: Remove this log
  console.log(params);

  // Create QueryCommand
  const command = new QueryCommand(params);

  // TODO: Catch errors and throw QPQ ones
  const data = await dynamoClient.send(command);

  return (data.Items?.map((i) => convertDynamoMapToObject(i)) || []) as Item[];
}
