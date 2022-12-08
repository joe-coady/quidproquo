import { HeadObjectCommand } from '@aws-sdk/client-s3';

import s3Client from './s3Client';

export const objectExists = async (bucketName: string, key: string): Promise<boolean> => {
  try {
    const response = await s3Client.send(
      new HeadObjectCommand({
        Key: key,
        Bucket: bucketName,
      }),
    );

    return true;
  } catch {
    return false;
  }
};
