import { S3Client, DeleteObjectsCommand, DeleteObjectsCommandInput } from '@aws-sdk/client-s3';
import { createAwsClient } from '../createAwsClient';

export const deleteFiles = async (
  drive: string,
  filepaths: string[],
  region: string,
): Promise<string[]> => {
  const s3Client = createAwsClient(S3Client, { region });

  const bucketParams: DeleteObjectsCommandInput = {
    Bucket: drive,
    Delete: {
      Quiet: true,
      Objects: filepaths.map((fp) => ({ Key: fp })),
    },
  };

  const response = await s3Client.send(new DeleteObjectsCommand(bucketParams));

  return (response.Errors || []).map((e) => e.Key || '');
};
