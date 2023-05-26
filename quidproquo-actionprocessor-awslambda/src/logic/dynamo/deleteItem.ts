import {
  DynamoDBClient,
  DeleteItemCommand,
  DeleteItemCommandInput,
} from '@aws-sdk/client-dynamodb';

import { KvsCoreDataType } from 'quidproquo-core';
import { buildAttributeValue } from './qpqDynamoOrm';

export async function deleteItem(
  tableName: string,
  region: string,
  key: KvsCoreDataType,
  sortKey?: KvsCoreDataType,
): Promise<void> {
  const dynamoClient = new DynamoDBClient({ region });

  const deleteItemParams: DeleteItemCommandInput = {
    TableName: tableName,
    Key: {
      key: buildAttributeValue(key),
    },
  };

  if (sortKey != undefined) {
    deleteItemParams.Key!.sortKey = buildAttributeValue(sortKey);
  }

  await dynamoClient.send(new DeleteItemCommand(deleteItemParams));
}
