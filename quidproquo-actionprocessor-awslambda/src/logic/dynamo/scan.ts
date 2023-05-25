import { DynamoDBClient, ScanCommand, ScanCommandInput } from '@aws-sdk/client-dynamodb';

import { KvsQueryOperation } from 'quidproquo-core';
import { convertDynamoMapToObject } from './convertObjectToDynamoMap';

import {
  buildExpressionAttributeValues,
  buildExpressionAttributeNames,
  buildDynamoQueryExpression,
} from './qpqDynamoOrm';

export async function scan<Item>(
  tableName: string,
  region: string,
  filterExpression?: KvsQueryOperation,
): Promise<Item[]> {
  // Instantiate DynamoDB client
  const dynamoClient = new DynamoDBClient({ region });

  const params: ScanCommandInput = {
    TableName: tableName,
    FilterExpression: buildDynamoQueryExpression(filterExpression),
    ExpressionAttributeValues: buildExpressionAttributeValues([filterExpression]),
    ExpressionAttributeNames: buildExpressionAttributeNames([filterExpression]),
  };

  console.log(params);

  // Create ScanCommand
  const command = new ScanCommand(params);

  // TODO: Catch errors and throw QPQ ones
  const data = await dynamoClient.send(command);

  return (data.Items?.map((i) => convertDynamoMapToObject(i)) || []) as Item[];
}
