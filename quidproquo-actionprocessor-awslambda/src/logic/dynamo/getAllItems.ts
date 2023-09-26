import { DynamoDBClient, ScanCommand, ScanCommandInput } from '@aws-sdk/client-dynamodb';
import { createAwsClient } from '../createAwsClient';

export async function getAllItems(tableName: string, region: string): Promise<any[]> {
  const dynamoDBClient = createAwsClient(DynamoDBClient, { region });

  let records: any[] = [];
  let lastEvaluatedKey: { [key: string]: any } | undefined;

  do {
    const scanParams: ScanCommandInput = {
      TableName: tableName,
      ExclusiveStartKey: lastEvaluatedKey,
    };

    try {
      const result = await dynamoDBClient.send(new ScanCommand(scanParams));
      records = records.concat(result.Items as any[]);
      lastEvaluatedKey = result.LastEvaluatedKey;
    } catch (error) {
      console.error('Error scanning DynamoDB table:', error);
      throw error;
    }
  } while (lastEvaluatedKey);

  return records;
}
