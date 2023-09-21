import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

import { awsNamingUtils } from 'quidproquo-actionprocessor-awslambda';

import { StoryResult, qpqCoreUtils, QPQConfig } from 'quidproquo-core';

import { getAwsServiceAccountInfoConfig, getAwsServiceAccountInfoByDeploymentInfo } from "quidproquo-config-aws";

export const storyLogger = async (
  result: StoryResult<any>,
  bucketName: string,
  region: string,
): Promise<void> => {
  try {
    const s3Client = new S3Client({ region });

    await s3Client.send(
      new PutObjectCommand({
        Key: `${result.correlation}.json`,
        Bucket: bucketName,
        Body: JSON.stringify(result),
      }),
    );
  } catch {
    console.log(`Failed to log story result to S3 [${result.correlation}]`);
  }
};

export const getLogger = (qpqConfig: QPQConfig) => {
  const awsSettings = getAwsServiceAccountInfoConfig(qpqConfig);

  console.log("process.env.storageDriveName: ", process.env.storageDriveName);
  
  // If we have no log service, just return nothing.
  if (!awsSettings.logServiceName || process.env.storageDriveName === "qpq-logs") {
    return async (result: StoryResult<any>) => {}
  }

  const service = awsSettings.logServiceName;
  const application = qpqCoreUtils.getApplicationName(qpqConfig);
  const environment = qpqCoreUtils.getApplicationModuleEnvironment(qpqConfig);
  const feature = qpqCoreUtils.getApplicationModuleFeature(qpqConfig);

  // Workout the bucket name.
  const bucketName = awsNamingUtils.getConfigRuntimeResourceName(
    "qpq-logs", 
    application, 
    service, 
    environment, 
    feature
  );

  // Where is this bucket?
  const regionForBucket = getAwsServiceAccountInfoByDeploymentInfo(
    qpqConfig,
    service,
    environment,
    feature,
    application
  ).awsRegion;

  console.log("Bucket for logs: ", bucketName, regionForBucket);

  return async (result: StoryResult<any>) => {  
    await storyLogger(result, bucketName, regionForBucket);
  }
};
