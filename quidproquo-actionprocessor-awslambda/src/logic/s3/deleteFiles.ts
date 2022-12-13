import { DeleteObjectsCommand, DeleteObjectsCommandInput } from '@aws-sdk/client-s3';

import s3Client from './s3Client';

export const deleteFiles = async (drive: string, filepaths: string[]): Promise<string[]> => {
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
