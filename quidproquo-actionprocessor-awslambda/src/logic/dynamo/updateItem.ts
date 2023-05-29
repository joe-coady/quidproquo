import { KvsUpdate, KvsCoreDataType, KvsUpdateAction } from 'quidproquo-core';
import {
  DynamoDBClient,
  UpdateItemCommand,
  UpdateItemCommandInput,
  AttributeValue,
} from '@aws-sdk/client-dynamodb';

import {
  buildAttributeValue,
  buildDynamoUpdateExpression,
  getValueName,
  buildUpdateExpressionAttributeNames,
} from './qpqDynamoOrm';

const buildUpdateExpressionAttributeValues = (
  updates: KvsUpdate,
): { [key: string]: AttributeValue } | undefined => {
  let attributeValues: { [key: string]: AttributeValue } = {};

  for (let update of updates) {
    if (update.value !== undefined) {
      const valuePlaceholder = getValueName(update.value);
      attributeValues[valuePlaceholder] = buildAttributeValue(update.value);
    }
  }

  return Object.keys(attributeValues).length > 0 ? attributeValues : undefined;
};

export async function updateItem<Item>(
  tableName: string,
  region: string,
  update: KvsUpdate,
  key: KvsCoreDataType,
  sortKey?: KvsCoreDataType,
): Promise<void> {
  const dynamoClient = new DynamoDBClient({ region });

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

  console.log(JSON.stringify(params, null, 2));

  await dynamoClient.send(new UpdateItemCommand(params));
}
