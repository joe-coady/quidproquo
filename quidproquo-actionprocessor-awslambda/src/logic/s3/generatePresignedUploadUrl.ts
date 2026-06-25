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
  // WHEN_REQUIRED disables the SDK v3 default request checksum (CRC32). Otherwise the
  // presigner bakes an empty-body checksum (x-amz-checksum-crc32=AAAAAA==) into the signed
  // URL, which never matches the real body the browser PUTs — S3 then rejects the upload and
  // the failure surfaces in the browser as a CORS error (the error response has no ACAO header).
  const s3Client = createAwsClient(S3Client, {
    region,
    requestChecksumCalculation: 'WHEN_REQUIRED',
  });

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