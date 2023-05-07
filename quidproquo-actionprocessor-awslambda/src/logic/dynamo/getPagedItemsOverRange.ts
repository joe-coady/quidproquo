import { DynamoDBClient, QueryCommand, QueryCommandInput } from '@aws-sdk/client-dynamodb';
import { QpqRuntimeType, StoryResultMetadata } from 'quidproquo-core';

import { QpqLogList } from 'quidproquo-webserver';

function lastEvaluatedKeyToString(lastEvaluatedKey: any): string {
  return Buffer.from(JSON.stringify(lastEvaluatedKey)).toString('base64');
}

function stringToLastEvaluatedKey(encodedKey: string): any {
  return JSON.parse(Buffer.from(encodedKey, 'base64').toString());
}

export async function getPagedItemsOverRange(
  tableName: string,
  region: string,
  runtimeType: string,
  startIsoDateTime: string,
  endIsoDateTime: string,
  pageKey?: string,
): Promise<QpqLogList> {
  const dynamoDBClient = new DynamoDBClient({ region });

  const queryParams: QueryCommandInput = {
    TableName: tableName,
    KeyConditionExpression:
      'runtimeType = :runtimeType AND startedAtWithCorrelation BETWEEN :startIsoDateTime AND :endIsoDateTime',
    ExpressionAttributeValues: {
      ':runtimeType': { S: runtimeType },
      ':startIsoDateTime': { S: startIsoDateTime + '#00000000-0000-0000-0000-000000000000' },
      ':endIsoDateTime': { S: endIsoDateTime + '#ffffffff-ffff-ffff-ffff-ffffffffffff' },
    },
    ScanIndexForward: false,
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
    console.error(`Failed to query items in the specified date range: ${err}`);
    throw err;
  }
}
