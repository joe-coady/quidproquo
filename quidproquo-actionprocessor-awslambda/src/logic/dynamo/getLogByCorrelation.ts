import { QpqRuntimeType, StoryResultMetadata } from 'quidproquo-core';
import { DynamoDBClient, QueryCommand, QueryCommandInput } from '@aws-sdk/client-dynamodb';

import { createAwsClient } from '../createAwsClient';

export async function getLogByCorrelation(tableName: string, region: string, correlation: string): Promise<StoryResultMetadata> {
  const dynamoDBClient = createAwsClient(DynamoDBClient, { region });

  const queryParams: QueryCommandInput = {
    TableName: tableName,
    IndexName: 'CorrelationIndex', // use the GSI
    KeyConditionExpression: 'correlation = :correlation',
    ExpressionAttributeValues: {
      ':correlation': { S: correlation },
    },
  };

  try {
    const queryResult = await dynamoDBClient.send(new QueryCommand(queryParams));

    const items = (queryResult.Items || []).map((i) => {
      const [startedAt, correlation] = i.startedAtWithCorrelation.S?.split('#') || [];
      const metaData: StoryResultMetadata = {
        generic: i.generic.S || '',
        runtimeType: i.runtimeType.S as QpqRuntimeType,
        error: i.error?.S,
        startedAt: startedAt,
        correlation,
        moduleName: i.moduleName.S || '',
        fromCorrelation: i.fromCorrelation?.S,
        executionTimeMs: i.executionTimeMs?.N ? parseInt(i.executionTimeMs.N) : 0,
      };

      return metaData;
    });

    const [result] = items;

    if (!result) {
      throw new Error(`Failed to find log with correlation: ${correlation}`);
    }

    return result;
  } catch (err) {
    console.error(`Failed to find log: ${err}`);
    throw err;
  }
}
