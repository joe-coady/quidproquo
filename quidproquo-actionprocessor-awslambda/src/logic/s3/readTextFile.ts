import { GetObjectCommand } from '@aws-sdk/client-s3';

import s3Client from './s3Client';

export const readTextFile = async (bucketName: string, key: string): Promise<string> => {
  const response = await s3Client.send(
    new GetObjectCommand({
      Key: key,
      Bucket: bucketName,
    }),
  );

  return (await response.Body?.transformToString()) || '';
};
