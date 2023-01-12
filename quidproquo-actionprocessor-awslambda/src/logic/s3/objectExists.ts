import { S3Client } from '@aws-sdk/client-s3';

import { HeadObjectCommand } from '@aws-sdk/client-s3';

export const objectExists = async (
  bucketName: string,
  key: string,
  region: string,
): Promise<boolean> => {
  try {
    const s3Client = new S3Client({ region });

    await s3Client.send(
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
