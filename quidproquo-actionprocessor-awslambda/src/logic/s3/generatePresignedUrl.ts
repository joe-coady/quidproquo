import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createAwsClient } from '../createAwsClient';

export const generatePresignedUrl = async (
  bucketName: string,
  objectKey: string,
  region: string,
  expirationMs: number,
): Promise<string> => {
  const s3Client = createAwsClient(S3Client, { region });

  // Define the command for getting an object, which will be presigned
  const getObjectCommand = new GetObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
  });

  try {
    const url = await getSignedUrl(s3Client, getObjectCommand, { expiresIn: expirationMs });
    return url;
  } catch (error) {
    console.error('Error generating presigned URL', error);
    throw error;
  }
};
