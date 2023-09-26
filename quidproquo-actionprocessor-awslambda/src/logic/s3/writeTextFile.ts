import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { createAwsClient } from '../createAwsClient';

export const writeTextFile = async (
  bucketName: string,
  key: string,
  data: string,
  region: string,
): Promise<void> => {
  const s3Client = createAwsClient(S3Client, { region });

  await s3Client.send(
    new PutObjectCommand({
      Key: key,
      Bucket: bucketName,
      Body: Buffer.from(data),
    }),
  );
};
