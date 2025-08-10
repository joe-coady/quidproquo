import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { createAwsClient } from '../createAwsClient';

// export const generatePresignedUploadFormUrl = async (
//   bucketName: string, 
//   objectKey: string, 
//   region: string, 
//   expirationMs: number,
//   contentType: string | undefined,
//   maxSizeBytes?: number | undefined
// ): Promise<{ url: string; fields: Record<string, string> }> => {
//   const s3Client = createAwsClient(S3Client, { region });

//   const conditions: any[] = [];
  
//   // Add content type condition if provided
//   if (contentType) {
//     conditions.push(['eq', '$Content-Type', contentType]);
//   }
  
//   // Add file size limit condition if provided
//   if (maxSizeBytes) {
//     conditions.push(['content-length-range', 0, maxSizeBytes]);
//   }

//   const presignedPost = await createPresignedPost(s3Client, {
//     Bucket: bucketName,
//     Key: objectKey,
//     Conditions: conditions,
//     Expires: Math.floor(expirationMs / 1000),
//   });

//   return {
//     url: presignedPost.url,
//     fields: presignedPost.fields
//   };
// };

export const generatePresignedUploadUrl = async (
  bucketName: string, 
  objectKey: string, 
  region: string, 
  expirationMs: number,
  correlationId?: string,
  contentType?: string
): Promise<string> => {
  const s3Client = createAwsClient(S3Client, { region });

  const putObjectCommand = new PutObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
    ContentType: contentType,

    Metadata: {
      ...(correlationId && { 'correlation-id': correlationId }),
      'upload-timestamp': Date.now().toString()
    }
  });

  const url = await getSignedUrl(s3Client, putObjectCommand, {
    expiresIn: expirationMs / 1000,
  });
  
  return url;
};