import { PutObjectCommand } from '@aws-sdk/client-s3';

import s3Client from './s3Client';

export const writeTextFile = async (
  bucketName: string,
  key: string,
  data: string,
): Promise<void> => {
  await s3Client.send(
    new PutObjectCommand({
      Key: key,
      Bucket: bucketName,
      Body: Buffer.from(data),
    }),
  );
};
