import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

import { awsNamingUtils } from 'quidproquo-actionprocessor-awslambda';

import { StoryResult, qpqCoreUtils, QPQConfig } from 'quidproquo-core';

import { QPQ_LOG_BUCKET_NAME } from '../../constants';

export const storyLogger = async (
  result: StoryResult<any>,
  qpqConfig: QPQConfig,
): Promise<void> => {
  const bucketName = awsNamingUtils.getQpqRuntimeResourceNameFromConfig(
    QPQ_LOG_BUCKET_NAME,
    qpqConfig,
    'log',
  );
  const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

  const s3Client = new S3Client({ region });

  await s3Client.send(
    new PutObjectCommand({
      Key: `${result.correlation}.json`,
      Bucket: bucketName,
      Body: JSON.stringify(result),
    }),
  );
};

export const getLogger = (qpqConfig: QPQConfig) => async (result: StoryResult<any>) => {
  await storyLogger(result, qpqConfig);
};
