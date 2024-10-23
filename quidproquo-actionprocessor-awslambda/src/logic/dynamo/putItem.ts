import { KvsKey,KvsObjectDataType } from 'quidproquo-core';

import { AttributeValue,DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

import { createAwsClient } from '../createAwsClient';
import { buildAttributeValue } from './qpqDynamoOrm';

export interface PutItemOptions {
  expires?: number;
}

// We currently only support objects as root items in dynamo
// Storing a list (array) as the root of your DynamoDB record is indeed possible,
// but there are some caveats. One of the main challenges is that DynamoDB doesn't support
// complex operations on list items. For instance, you can't perform a conditional update or
// delete on a specific item in the list based on its value. However, you can read and write
// entire lists, and you can append items to a list with an update operation.
//
// TODO?: support lists as root items in dynamo ~ Probably not worth it
// a root list probably should be a table!
// Something like this:
// const convertObjectOrListToDynamoMap = (value: KvsObjectDataType | KvsListDataType): AttributeValue => {
//   const attributeValue = buildAttributeValue(value);
//   if ('M' in attributeValue) {
//     return attributeValue.M!;
//   }
//   if ('L' in attributeValue) {
//     return attributeValue.L!;
//   }
//   throw new Error("Value must be an object or a list");
// }

const convertObjectToDynamoItem = (obj: KvsObjectDataType): Record<string, AttributeValue> => {
  return buildAttributeValue(obj).M!;
};

export async function putItem<Item, T extends object = any>(
  tableName: string,
  item: Item,
  attributes: KvsKey[],
  options: PutItemOptions,
  region: string,
): Promise<void> {
  const dynamoDBClient = createAwsClient(DynamoDBClient, { region });

  await dynamoDBClient.send(
    new PutItemCommand({
      TableName: tableName,
      Item: convertObjectToDynamoItem(item as KvsObjectDataType),
    }),
  );
}
