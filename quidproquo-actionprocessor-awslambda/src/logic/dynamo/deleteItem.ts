import {
  DynamoDBClient,
  DeleteItemCommand,
  DeleteItemCommandInput,
} from '@aws-sdk/client-dynamodb';

import { KvsCoreDataType } from 'quidproquo-core';
import { buildAttributeValue } from './qpqDynamoOrm';
import { createAwsClient } from '../createAwsClient';

export async function deleteItem(
  tableName: string,
  region: string,
  key: KvsCoreDataType,
  keyName: string,
  sortKey?: KvsCoreDataType,
  sortKeyName?: string,
): Promise<void> {
  const dynamoDBClient = createAwsClient(DynamoDBClient, { region });

  const deleteItemParams: DeleteItemCommandInput = {
    TableName: tableName,
    Key: {
      [keyName]: buildAttributeValue(key),
    },
  };

  if (sortKey && sortKeyName) {
    deleteItemParams.Key![sortKeyName] = buildAttributeValue(sortKey);
  }

  await dynamoDBClient.send(new DeleteItemCommand(deleteItemParams));
}
