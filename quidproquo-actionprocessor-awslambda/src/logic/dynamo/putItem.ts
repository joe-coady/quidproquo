import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

export interface PutItemOptions {
  expires?: number;
}

export async function putItem<Value>(
  tableName: string,
  key: string,
  value: Value,
  options: PutItemOptions,
  region: string,
): Promise<void> {
  const dynamoClient = new DynamoDBClient({ region });

  await dynamoClient.send(
    new PutItemCommand({
      TableName: tableName,
      Item: {
        key: { S: key },
        value: { S: JSON.stringify(value) },
        ...(options.expires ? { expires: { N: options.expires.toString() } } : {}),
      },
    }),
  );
}
