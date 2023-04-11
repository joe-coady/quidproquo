import {
  DynamoDBClient,
  DeleteItemCommand,
  DeleteItemCommandInput,
} from '@aws-sdk/client-dynamodb';

export async function deleteItem(tableName: string, key: string, region: string): Promise<void> {
  const dynamoClient = new DynamoDBClient({ region });

  const deleteItemParams: DeleteItemCommandInput = {
    TableName: tableName,
    Key: {
      key: {
        S: key,
      },
    },
  };

  await dynamoClient.send(new DeleteItemCommand(deleteItemParams));
}
