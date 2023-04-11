import {
  DynamoDBClient,
  UpdateItemCommand,
  UpdateItemCommandInput,
} from '@aws-sdk/client-dynamodb';

// THIS DOES NOT WORK ~ DO NOT USE

export async function updateItem(
  tableName: string,
  key: string,
  value: any,
  options: { expires?: number } = {},
  region: string,
): Promise<void> {
  const dynamoClient = new DynamoDBClient({ region });

  const updateExpressions = Object.keys(value).map((attr, idx) => {
    return `SET #value.#${attr} = :${attr}`;
  });

  const expressionAttributeNames = {
    '#value': 'value',
    ...Object.keys(value).reduce((obj, attr) => {
      obj[`#${attr}`] = attr;
      return obj;
    }, {} as Record<string, string>),
  };

  const expressionAttributeValues = Object.keys(value).reduce((obj, attr) => {
    obj[`:${attr}`] = { S: JSON.stringify(value[attr]) };
    return obj;
  }, {} as Record<string, { S: string } | { N: string }>);

  if (options.expires) {
    updateExpressions.push('SET expires = :expires');
    expressionAttributeValues[':expires'] = { N: options.expires.toString() };
  }

  const updateItemParams: UpdateItemCommandInput = {
    TableName: tableName,
    Key: {
      key: {
        S: key,
      },
    },
    UpdateExpression: updateExpressions.join(', '),
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
  };

  console.log('updateItemParams:', JSON.stringify(updateItemParams, null, 2));

  try {
    await dynamoClient.send(new UpdateItemCommand(updateItemParams));
  } catch (error) {
    console.error('Error updating item:', error);
    throw error;
  }
}
