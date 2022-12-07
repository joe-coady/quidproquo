import {
  S3Client,
  ListObjectsV2Command,
  ListObjectsV2CommandInput,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { filePathDelimiter, FileInfo } from 'quidproquo-core';

const s3Client = new S3Client({ region: 'ap-southeast-2' });

export const listFiles = async (drive: string, folder: string = ''): Promise<FileInfo[]> => {
  const validatedPrefix = `${folder}${folder.endsWith(filePathDelimiter) ? '' : filePathDelimiter}`;
  const bucketParams: ListObjectsV2CommandInput = {
    Bucket: drive,
    Delimiter: filePathDelimiter,
    Prefix: validatedPrefix,
  };

  // Declare truncated as a flag that the while loop is based on.
  let truncated = true;
  let files: FileInfo[] = [];

  while (truncated) {
    const response = await s3Client.send(new ListObjectsV2Command(bucketParams));

    if (response.CommonPrefixes && !bucketParams.ContinuationToken) {
      files = [
        ...files,
        ...response.CommonPrefixes.filter((cp) => !!cp.Prefix).map((cp) => ({
          filepath: cp.Prefix!,
          drive: drive,
          isDir: true,
        })),
      ];
    }

    files = [
      ...files,
      ...(response.Contents || [])
        .filter((c) => !!c.Key && c.Key != folder)
        .map(
          (item): FileInfo => ({
            filepath: item.Key!,
            drive: drive,
            isDir: item.Key!.endsWith(filePathDelimiter),
            hashMd5: item.ETag,
          }),
        ),
    ];

    truncated = !!response.IsTruncated;
    if (truncated) {
      bucketParams.ContinuationToken = response.NextContinuationToken;
    }
  }

  return files;
};

export const readTextFile = async (bucketName: string, key: string): Promise<string> => {
  const response = await s3Client.send(
    new GetObjectCommand({
      Key: key,
      Bucket: bucketName,
    }),
  );

  return (await response.Body?.transformToString()) || '';
};
