import { KvsKey } from 'quidproquo-core';
import { DynamoDBClient, PutItemCommand, AttributeValue } from '@aws-sdk/client-dynamodb';
import { get } from 'lodash';

export interface PutItemOptions {
  expires?: number;
}

export type KvsKeyValue<T> = {
  key: KvsKey;
  value: T;
};

export type DynamoAttributeType = 'S' | 'N' | 'B';

export const readKvsAttributeValue = <T, K extends keyof T>(
  item: T,
  key: KvsKey,
): KvsKeyValue<T[K]> => {
  const value = get(item, key.key as K);

  return {
    key,
    value,
  };
};

export const getDynamoValueTypeFromKvsKey = (key: KvsKey): DynamoAttributeType => {
  switch (key.type) {
    case 'string':
      return 'S';
    case 'number':
      return 'N';
    case 'binary':
      return 'B';
  }
};

export async function putItem<Item>(
  tableName: string,
  key: string,
  item: Item,
  attributes: KvsKey[],
  options: PutItemOptions,
  region: string,
): Promise<void> {
  const dynamoClient = new DynamoDBClient({ region });

  // Read all the values from the item
  const dynamoProps: Record<string, AttributeValue> = attributes
    .filter((a, index, self) => index === self.findIndex((t) => t.key === a.key))
    .reduce((acc, attribute) => {
      const { key, value } = readKvsAttributeValue(item, attribute);
      const attributeValue = {
        [getDynamoValueTypeFromKvsKey(key)]: value,
      } as unknown as AttributeValue;

      acc[key.key] = attributeValue;

      return acc;
    }, {} as Record<string, AttributeValue>);

  await dynamoClient.send(
    new PutItemCommand({
      TableName: tableName,
      Item: {
        ...dynamoProps,
      },
    }),
  );
}
