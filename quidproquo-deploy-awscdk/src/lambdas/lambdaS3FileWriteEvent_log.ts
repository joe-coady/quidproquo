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
      filePath: { S: storyResultMetadata.filePath },
      startedAt: { S: storyResultMetadata.startedAt },
      error: { S: storyResultMetadata.error || '' },
      generic: { S: storyResultMetadata.generic },
      runtimeType: { S: storyResultMetadata.runtimeType },
    },
  });

  try {
    await dynamoDBClient.send(putItemCommand);
  } catch (err) {
    console.error(`Failed to insert storyResultMetadata into DynamoDB: ${err}`);
  }
};

export const executeS3FileWriteEvent: S3Handler = async (event: S3Event) => {
  for (const record of event.Records) {
    const bucketName = record.s3.bucket.name;
    const awsRegion = record.awsRegion;
    const key = record.s3.object.key;

    const storyResultMetadata = await readLogFromBucket(bucketName, awsRegion, key);

    await writeStoryResultMetadataToDynamo(bucketName, storyResultMetadata, awsRegion);
  }
};
