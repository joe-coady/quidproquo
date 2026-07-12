import { KvsQueryOperation } from 'quidproquo-core';

import { DynamoDBClient, ScanCommand, ScanCommandInput } from '@aws-sdk/client-dynamodb';

import { createAwsClient } from '../createAwsClient';
import { convertDynamoMapToObject } from './convertObjectToDynamoMap';
import { buildDynamoQueryExpression, buildExpressionAttributeNames, buildExpressionAttributeValues } from './qpqDynamoOrm';

export async function getAllItems(tableName: string, region: string, filterExpression?: KvsQueryOperation): Promise<any[]> {
  const dynamoDBClient = createAwsClient(DynamoDBClient, { region });

  let records: any[] = [];
  let lastEvaluatedKey: { [key: string]: any } | undefined;

  do {
    const scanParams: ScanCommandInput = {
      TableName: tableName,
      FilterExpression: buildDynamoQueryExpression(filterExpression),
      ExpressionAttributeValues: filterExpression && buildExpressionAttributeValues([filterExpression]),
      ExpressionAttributeNames: filterExpression && buildExpressionAttributeNames([filterExpression]),
      ExclusiveStartKey: lastEvaluatedKey,
    };

    try {
      const result = await dynamoDBClient.send(new ScanCommand(scanParams));
      records = records.concat((result.Items || []).map((item) => convertDynamoMapToObject(item)));
      lastEvaluatedKey = result.LastEvaluatedKey;
    } catch (error) {
      console.error('Error scanning DynamoDB table:', error);
      throw error;
    }
  } while (lastEvaluatedKey);

  return records;
}
