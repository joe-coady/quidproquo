import { DynamoDBClient, ScanCommand, ScanCommandInput } from '@aws-sdk/client-dynamodb';

import { KvsQueryOperation, QpqPagedData } from 'quidproquo-core';
import { convertDynamoMapToObject } from './convertObjectToDynamoMap';
import { stringToLastEvaluatedKey } from './logs';
import { itemsToQpqPagedData } from './utils/itemsToQpqPagedData';

import { buildExpressionAttributeValues, buildExpressionAttributeNames, buildDynamoQueryExpression } from './qpqDynamoOrm';
import { createAwsClient } from '../createAwsClient';

export async function scan<Item>(
  tableName: string,
  region: string,
  filterExpression?: KvsQueryOperation,
  pageKey?: string,
): Promise<QpqPagedData<Item>> {
  // Instantiate DynamoDB client
  const dynamoDBClient = createAwsClient(DynamoDBClient, { region });

  const params: ScanCommandInput = {
    TableName: tableName,
    FilterExpression: buildDynamoQueryExpression(filterExpression),
    ExpressionAttributeValues: filterExpression && buildExpressionAttributeValues([filterExpression]),
    ExpressionAttributeNames: filterExpression && buildExpressionAttributeNames([filterExpression]),
  };

  if (pageKey) {
    params.ExclusiveStartKey = stringToLastEvaluatedKey(pageKey);
  }

  // Create ScanCommand
  const command = new ScanCommand(params);

  // TODO: Catch errors and throw QPQ ones
  const data = await dynamoDBClient.send(command);

  return itemsToQpqPagedData((data.Items?.map((i) => convertDynamoMapToObject(i)) || []) as Item[], data.LastEvaluatedKey);
}
