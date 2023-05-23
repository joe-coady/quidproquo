import {
  DynamoDBClient,
  QueryCommand,
  QueryCommandInput,
  AttributeValue,
} from '@aws-sdk/client-dynamodb';

export async function query<Item>(tableName: string, region: string): Promise<void> {
  // Instantiate DynamoDB client
  const dynamoClient = new DynamoDBClient({ region });

  // Define query parameters
  // const params: QueryCommandInput = {
  //   TableName: tableName,
  //   // KeyConditionExpression: '#id = :idValue',
  //   FilterExpression: 'begins_with(test.#ok, :okValue)',
  //   ExpressionAttributeValues: {
  //     // ':idValue': { S: '1234' },
  //     ':okValue': { S: '11' },
  //   },
  //   ExpressionAttributeNames: {
  //     // '#test': 'test',
  //     '#ok': 'ok',
  //   },
  //   // ProjectionExpression: '#test.#ok',
  // };

  const params: QueryCommandInput = {
    TableName: tableName,
    // KeyConditionExpression: '#id = :idValue',
    KeyConditionExpression:
      '((#id = :idValueA) AND (#startedAt BETWEEN :startedAtValueA AND :startedAtValueB))',
    ExpressionAttributeValues: {
      ':idValueA': { S: '1234' },
      ':startedAtValueA': { S: '2023-05-23T04:12:17.000Z' },
      ':startedAtValueB': { S: '2023-05-23T04:12:39.000Z' },
    },
    ExpressionAttributeNames: {
      '#startedAt': 'startedAt',
      '#id': 'id',
    },
  };

  // Create QueryCommand
  const command = new QueryCommand(params);

  try {
    // Send the QueryCommand
    const data = await dynamoClient.send(command);
    console.log('Success', JSON.stringify(data.Items, null, 2));
  } catch (error) {
    console.error('Error', error);
  }
}
