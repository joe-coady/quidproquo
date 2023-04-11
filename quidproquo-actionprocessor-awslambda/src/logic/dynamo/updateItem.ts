import {
  DynamoDBClient,
  UpdateItemCommand,
  UpdateItemCommandInput,
} from '@aws-sdk/client-dynamodb';

export async function updateItem(
  tableName: string,
  key: string,
  value: any,
  options: { expires?: number } = {},
  region: string,
): Promise<void> {
  const dynamoClient = new DynamoDBClient({ region });

  const updateItemParams: UpdateItemCommandInput = {
    TableName: tableName,
    Key: {
      key: {
        S: key,
      },
    },
    UpdateExpression: 'SET #value = :value' + (options.expires ? ', expires = :expires' : ''),
    ExpressionAttributeNames: {
      '#value': 'value',
    },
    ExpressionAttributeValues: {
      ':value': {
        S: JSON.stringify(value),
      },
      ...(options.expires ? { ':expires': { N: options.expires.toString() } } : {}),
    },
  };

  await dynamoClient.send(new UpdateItemCommand(updateItemParams));
}
