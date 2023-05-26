import { KvsKey } from 'quidproquo-core';
import { DynamoDBClient, PutItemCommand, AttributeValue } from '@aws-sdk/client-dynamodb';
import { get } from 'lodash';
import { convertObjectToDynamoMap } from './convertObjectToDynamoMap';

export interface PutItemOptions {
  expires?: number;
}

export async function putItem<Item>(
  tableName: string,
  item: Item,
  attributes: KvsKey[],
  options: PutItemOptions,
  region: string,
): Promise<void> {
  const dynamoClient = new DynamoDBClient({ region });

  await dynamoClient.send(
    new PutItemCommand({
      TableName: tableName,
      Item: convertObjectToDynamoMap(item),
    }),
  );
}
