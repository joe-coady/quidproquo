import { QPQBinaryData } from 'quidproquo-core';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export const writeBinaryFile = async (
  bucketName: string,
  key: string,
  data: QPQBinaryData,
  region: string,
): Promise<void> => {
  const s3Client = new S3Client({ region });

  await s3Client.send(
    new PutObjectCommand({
      Key: key,
      Bucket: bucketName,
      Body: Buffer.from(data.base64Data, 'base64'),
      ContentType: data.mimetype,
      ContentDisposition: data.contentDisposition,
    }),
  );
};
