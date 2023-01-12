import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

export const readTextFile = async (
  bucketName: string,
  key: string,
  region: string,
): Promise<string> => {
  const s3Client = new S3Client({ region });

  const response = await s3Client.send(
    new GetObjectCommand({
      Key: key,
      Bucket: bucketName,
    }),
  );

  return (await response.Body?.transformToString()) || '';
};
