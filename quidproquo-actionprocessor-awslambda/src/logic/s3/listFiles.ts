import { ListObjectsV2Command, ListObjectsV2CommandInput } from '@aws-sdk/client-s3';
import { filePathDelimiter } from 'quidproquo-core';
import s3Client from './s3Client';

export interface S3FileInfo {
  filepath: string;
  isDir: boolean;
  hashMd5?: string;
}

export interface S3FileList {
  fileInfos: S3FileInfo[];
  pageToken?: string;
}

export const listFiles = async (
  drive: string,
  folder: string = '',
  maxKeys: number = 1000,
  pageToken?: string,
): Promise<S3FileList> => {
  const validatedPrefix = `${folder}${
    folder.endsWith(filePathDelimiter) || !folder ? '' : filePathDelimiter
  }`;
  const bucketParams: ListObjectsV2CommandInput = {
    Bucket: drive,
    Delimiter: filePathDelimiter,
    Prefix: validatedPrefix,
    ContinuationToken: pageToken,
    MaxKeys: maxKeys,
  };

  // Declare truncated as a flag that the while loop is based on.
  let files: S3FileInfo[] = [];

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
        (item): S3FileInfo => ({
          filepath: item.Key!,
          isDir: item.Key!.endsWith(filePathDelimiter),
          hashMd5: item.ETag,
        }),
      ),
  ];

  return {
    fileInfos: files,
    pageToken: response.NextContinuationToken,
  };
};
