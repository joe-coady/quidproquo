import { DynamoDBClient, GetItemCommand, GetItemCommandInput } from '@aws-sdk/client-dynamodb';

export async function getItem(tableName: string, key: string, region: string): Promise<any | null> {
  const dynamoDBClient = new DynamoDBClient({ region });

  const getItemParams: GetItemCommandInput = {
    TableName: tableName,
    Key: {
      key: {
        S: key,
      },
    },
  };

  try {
    const result = await dynamoDBClient.send(new GetItemCommand(getItemParams));
    return result.Item ? JSON.parse(result.Item.value.S as string) : null;
  } catch (error) {
    console.error('Error getting item from DynamoDB:', error);
    throw error;
  }
}
