import { KvsCoreDataType } from 'quidproquo-core';

import { DynamoDBClient, GetItemCommand, GetItemCommandInput } from '@aws-sdk/client-dynamodb';

import { createAwsClient } from '../createAwsClient';
import { convertDynamoMapToObject } from './convertObjectToDynamoMap';
import { buildAttributeValue } from './qpqDynamoOrm';

export async function getItem(
  tableName: string,
  region: string,
  keyName: string,
  key: KvsCoreDataType,
  sortKeyName?: string,
  sortKey?: KvsCoreDataType,
): Promise<any | null> {
  const dynamoDBClient = createAwsClient(DynamoDBClient, { region });

  const getItemParams: GetItemCommandInput = {
    TableName: tableName,
    Key: {
      [keyName]: buildAttributeValue(key),
    },
  };

  if (sortKeyName && sortKey !== undefined) {
    getItemParams.Key![sortKeyName] = buildAttributeValue(sortKey);
  }

  try {
    const result = await dynamoDBClient.send(new GetItemCommand(getItemParams));
    return result.Item ? convertDynamoMapToObject(result.Item) : null;
  } catch (error) {
    console.error('Error getting item from DynamoDB:', error);
    throw error;
  }
}
