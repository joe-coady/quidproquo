import { S3Event, S3Handler } from 'aws-lambda';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

import { StoryResultMetadata, StoryResult } from 'quidproquo-core';
import { storyResultToMetadata } from './storyResultToMetadata';

const readLogFromBucket = async (
  bucketName: string,
  region: string,
  key: string,
): Promise<StoryResultMetadata> => {
  try {
    const s3Client = new S3Client({ region });

    const response = await s3Client.send(
      new GetObjectCommand({
        Key: key,
        Bucket: bucketName,
      }),
    );

    const storyResult = JSON.parse(
      (await response.Body?.transformToString()) || '{}',
    ) as StoryResult<any>;

    return storyResultToMetadata(storyResult, key);
  } catch (err) {
    console.log(`Error: ${bucketName}::${key} - ${err}`);
    throw err;
  }
};

const writeStoryResultMetadataToDynamo = async (
  tableName: string,
  storyResultMetadata: StoryResultMetadata,
  region: string,
): Promise<void> => {
  const dynamoDBClient = new DynamoDBClient({ region });

  const putItemCommand = new PutItemCommand({
    TableName: tableName,
    Item: {
      startedAtWithCorrelation: {
        S: `${storyResultMetadata.startedAt}#${storyResultMetadata.correlation}`,
      },
      runtimeType: { S: storyResultMetadata.runtimeType },
      correlation: { S: storyResultMetadata.correlation },
      error: { S: storyResultMetadata.error || '' },
      generic: { S: storyResultMetadata.generic },
      moduleName: { S: storyResultMetadata.moduleName },
      fromCorrelation: { S: storyResultMetadata.fromCorrelation || '' },
      executionTimeMs: { N: storyResultMetadata.executionTimeMs.toString() },
    },
  });

  try {
    await dynamoDBClient.send(putItemCommand);
  } catch (err) {
    console.error(`Failed to insert storyResultMetadata into DynamoDB: ${err}`);
  }
};

export const getFromCorrelationBucketNameFromLog = (
  storyResultMetadata: StoryResultMetadata,
  localBucketName: string,
): string => {
  if (!storyResultMetadata.fromCorrelation) {
    return '';
  }

  // Get the module name of the service that wants the log
  const fromModuleName = storyResultMetadata.fromCorrelation.split('::')[0];

  // Get the name of the current module where we are executing this code
  const currentModuleName = storyResultMetadata.moduleName;

  // Split up the bucket / module names into parts
  const bucketParts = localBucketName.split('-');
  const moduleParts = fromModuleName.split('-');
  const currentModuleNameParts = currentModuleName.split('-');

  // Replace the current module name with the module name of the service that wants the log
  bucketParts.splice(2, currentModuleNameParts.length, ...moduleParts);

  // rebuild the new bucket name
  const newBucketName = bucketParts.join('-');

  return newBucketName;
};

function getFromCorrelationDynamoTableNameFromBucketName(bucketName: string): string {
  const target = 'qpqlog';
  const replacement = 'qpqflog';

  if (bucketName.endsWith(target)) {
    return bucketName.slice(0, bucketName.length - target.length) + replacement;
  }

  return bucketName;
}

export const executeS3FileWriteEvent: S3Handler = async (event: S3Event) => {
  for (const record of event.Records) {
    const bucketName = record.s3.bucket.name;
    const awsRegion = record.awsRegion;
    const key = decodeURIComponent(record.s3.object.key);

    const storyResultMetadata = await readLogFromBucket(bucketName, awsRegion, key);

    // Write the main log to the service table
    await writeStoryResultMetadataToDynamo(bucketName, storyResultMetadata, awsRegion);

    // Write the same log to the table of the from service, so it can query links on the fromGuid GSI
    const fromBucketName = getFromCorrelationBucketNameFromLog(storyResultMetadata, bucketName);

    const targetFromCorrelationDynamoTableName =
      getFromCorrelationDynamoTableNameFromBucketName(fromBucketName);

    if (targetFromCorrelationDynamoTableName) {
      await writeStoryResultMetadataToDynamo(
        targetFromCorrelationDynamoTableName,
        storyResultMetadata,
        awsRegion,
      );
    }
  }
};
