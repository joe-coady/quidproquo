import { QPQBinaryData } from 'quidproquo-core';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

export const readBinaryFile = async (
  bucketName: string,
  key: string,
  region: string,
): Promise<QPQBinaryData> => {
  const s3Client = new S3Client({ region });

  const response = await s3Client.send(
    new GetObjectCommand({
      Key: key,
      Bucket: bucketName,
    }),
  );

  return {
    base64Data: await response.Body?.transformToString('base64')!,
  };
};
