import {
  DynamoDBClient,
  UpdateItemCommand,
  UpdateItemCommandInput,
} from '@aws-sdk/client-dynamodb';

import { KvsUpdate, KvsCoreDataType } from 'quidproquo-core';

import {
  buildAttributeValue,
  buildDynamoUpdateExpression,
  buildUpdateExpressionAttributeNames,
  buildUpdateExpressionAttributeValues,
} from './qpqDynamoOrm';
import { createAwsClient } from '../createAwsClient';

export async function updateItem(
  tableName: string,
  region: string,
  update: KvsUpdate,
  key: KvsCoreDataType,
  sortKey?: KvsCoreDataType,
): Promise<void> {
  const dynamoDBClient = createAwsClient(DynamoDBClient, { region });

  const params: UpdateItemCommandInput = {
    TableName: tableName,
    Key: {
      id: buildAttributeValue(key),
    },
    UpdateExpression: buildDynamoUpdateExpression(update),
    ExpressionAttributeValues: buildUpdateExpressionAttributeValues(update),
    ExpressionAttributeNames: buildUpdateExpressionAttributeNames(update),
  };

  if (sortKey) {
    params.Key!['sk'] = buildAttributeValue(sortKey);
  }

  console.log(await dynamoDBClient.send(new UpdateItemCommand(params)));
}
