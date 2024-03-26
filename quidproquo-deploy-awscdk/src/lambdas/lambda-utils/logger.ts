import fs from 'fs';
import path from 'path';

import { S3Client, PutObjectCommand, PutObjectCommandInput } from '@aws-sdk/client-s3';

import { awsNamingUtils } from 'quidproquo-actionprocessor-awslambda';

import { StoryResult, qpqCoreUtils, QPQConfig, QpqLogger } from 'quidproquo-core';

const tempDirectory = '/tmp/qpqlogs';

import {
  getAwsServiceAccountInfoConfig,
  getAwsServiceAccountInfoByDeploymentInfo,
} from 'quidproquo-config-aws';

export const storyLogger = async (
  result: StoryResult<any>,
  bucketName: string,
  region: string,
): Promise<void> => {
  try {
    const s3Client = new S3Client({ region });

    const commandParams: PutObjectCommandInput = {
      Key: `${result.correlation}.json`,
      Bucket: bucketName,
      Body: JSON.stringify(result),
      StorageClass: 'INTELLIGENT_TIERING',
    };

    await s3Client.send(new PutObjectCommand(commandParams));
  } catch {
    console.log(`Failed to log story result to S3 [${result.correlation}]`);
  }
};

export const storyLoggerFs = async (result: StoryResult<any>): Promise<void> => {
  try {
    await fs.promises.mkdir(tempDirectory, { recursive: true });

    const filePath = path.join(tempDirectory, `${result.correlation}.json`);
    await fs.promises.writeFile(filePath, JSON.stringify(result));
    console.log(`Story result logged to temporary file [${filePath}]`);
  } catch (error) {
    console.log(`Failed to log story result to temporary file [${result.correlation}]`);
    console.error(error);
  }
};

export const moveLogsToPerminateStorage = async (
  bucketName: string,
  region: string,
): Promise<void> => {
  try {
    await fs.promises.mkdir(tempDirectory, { recursive: true });
    const files = await fs.promises.readdir(tempDirectory);

    for (const file of files) {
      const filePath = path.join(tempDirectory, file);
      const data = await fs.promises.readFile(filePath, 'utf-8');
      const result: StoryResult<any> = JSON.parse(data);

      await storyLogger(result, bucketName, region);

      await fs.promises.unlink(filePath);
      console.log(`Moved log file [${file}] to S3 and deleted from temporary directory`);
    }
  } catch (error) {
    console.error('Failed to move logs to permanent storage');
    console.error(error);
  }
};

export const getLogger = (qpqConfig: QPQConfig): QpqLogger => {
  const awsSettings = getAwsServiceAccountInfoConfig(qpqConfig);

  // If we have no log service, just return nothing.
  if (
    !awsSettings.logServiceName ||
    awsSettings.disableLogs ||
    process.env.storageDriveName === 'qpq-logs'
  ) {
    return {
      log: async () => {},
      waitToFinishWriting: async () => {},
      moveToPermanentStorage: async () => {},
    };
  }

  const service = awsSettings.logServiceName;
  const application = qpqCoreUtils.getApplicationName(qpqConfig);
  const environment = qpqCoreUtils.getApplicationModuleEnvironment(qpqConfig);
  const feature = qpqCoreUtils.getApplicationModuleFeature(qpqConfig);

  // Workout the bucket name.
  const bucketName = awsNamingUtils.getConfigRuntimeResourceName(
    'qpq-logs',
    application,
    service,
    environment,
    feature,
  );

  // Where is this bucket?
  const regionForBucket = getAwsServiceAccountInfoByDeploymentInfo(
    qpqConfig,
    service,
    environment,
    feature,
    application,
  ).awsRegion;

  console.log('Bucket for logs: ', bucketName, regionForBucket);

  const logs: Promise<void>[] = [];

  return {
    log: async (result: StoryResult<any>) => {
      const promise = storyLoggerFs(result).catch((e) => {
        console.log('Failed to log story result to S3', JSON.stringify(e, null, 2));
      });

      logs.push(promise);

      console.log('Added to logs', logs.length);
    },
    waitToFinishWriting: async () => {
      console.log('logs.length', logs.length);

      console.time('Writing Logs');
      await Promise.all(logs);
      console.timeEnd('Writing Logs');

      console.log('done writing logs');
    },
    moveToPermanentStorage: async () => {
      await moveLogsToPerminateStorage(bucketName, regionForBucket);
    },
  };
};
