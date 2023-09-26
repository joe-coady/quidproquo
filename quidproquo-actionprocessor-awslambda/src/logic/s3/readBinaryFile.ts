import { QPQBinaryData } from 'quidproquo-core';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { createAwsClient } from '../createAwsClient';

export const readBinaryFile = async (
  bucketName: string,
  key: string,
  region: string,
): Promise<QPQBinaryData> => {
  const s3Client = createAwsClient(S3Client, { region });

  const response = await s3Client.send(
    new GetObjectCommand({
      Key: key,
      Bucket: bucketName,
    }),
  );

  return {
    base64Data: await response.Body?.transformToString('base64')!,
    mimetype: response.ContentType,
    filename: key.split('/').pop()!,
    contentDisposition: response.ContentDisposition,
  };
};
