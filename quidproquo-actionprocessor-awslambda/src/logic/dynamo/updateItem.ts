import {
  DynamoDBClient,
  ReturnValue,
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
import { convertDynamoMapToObject } from './convertObjectToDynamoMap';

export async function updateItem<Item>(
  tableName: string,
  region: string,
  update: KvsUpdate,
  keyName: string,
  key: KvsCoreDataType,
  sortKey?: KvsCoreDataType,
): Promise<Item> {
  const dynamoDBClient = createAwsClient(DynamoDBClient, { region });

  const params: UpdateItemCommandInput = {
    TableName: tableName,
    Key: {
      [keyName]: buildAttributeValue(key),
    },
    UpdateExpression: buildDynamoUpdateExpression(update),
    ExpressionAttributeValues: buildUpdateExpressionAttributeValues(update),
    ExpressionAttributeNames: buildUpdateExpressionAttributeNames(update),
    ReturnValues: ReturnValue.ALL_NEW,
  };

  if (sortKey) {
    params.Key!['sk'] = buildAttributeValue(sortKey);
  }

  const result = await dynamoDBClient.send(new UpdateItemCommand(params));

  return convertDynamoMapToObject(result.Attributes) as Item;
}
