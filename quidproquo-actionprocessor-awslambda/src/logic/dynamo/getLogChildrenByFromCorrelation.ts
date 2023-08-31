import { DynamoDBClient, QueryCommand, QueryCommandInput } from '@aws-sdk/client-dynamodb';

import { QpqRuntimeType, StoryResultMetadata } from 'quidproquo-core';
import { QpqLogList } from 'quidproquo-webserver';

import { lastEvaluatedKeyToString, stringToLastEvaluatedKey } from './logs';

export async function getLogChildrenByFromCorrelation(
  tableName: string,
  region: string,
  fromCorrelation: string,
  pageKey?: string,
): Promise<QpqLogList> {
  const dynamoDBClient = new DynamoDBClient({ region });

  const queryParams: QueryCommandInput = {
    TableName: tableName,
    // removed IndexName
    KeyConditionExpression: '#fromCorrelation = :fromCorrelation', // use the primary key
    ExpressionAttributeNames: {
      '#fromCorrelation': 'fromCorrelation', // define attribute name
    },
    ExpressionAttributeValues: {
      ':fromCorrelation': { S: fromCorrelation },
    },
  };

  if (pageKey) {
    queryParams.ExclusiveStartKey = stringToLastEvaluatedKey(pageKey);
  }

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

    if (queryResult.LastEvaluatedKey) {
      const nextPageKey = lastEvaluatedKeyToString(queryResult.LastEvaluatedKey);
      // You can return the nextPageKey along with the items, so it can be used for the next query.
      return { items, nextPageKey };
    } else {
      return { items };
    }
  } catch (err) {
    console.error(`Failed to query items with the specified fromCorrelation: ${err}`);
    throw err;
  }
}
