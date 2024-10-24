import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  FileActionType,
  FileWriteBinaryContentsActionProcessor,
  QPQConfig,
} from 'quidproquo-core';

import { getS3BucketStorageClassFromStorageDriveTier } from '../../../awsLambdaUtils';
import { writeBinaryFile } from '../../../logic/s3/s3Utils';
import { resolveStorageDriveBucketName } from './utils';

const getProcessFileWriteBinaryContents = (qpqConfig: QPQConfig): FileWriteBinaryContentsActionProcessor => {
  return async ({ drive, filepath, data, storageDriveAdvancedWriteOptions }) => {
    const s3BucketName = resolveStorageDriveBucketName(drive, qpqConfig);

    await writeBinaryFile(
      s3BucketName,
      filepath,
      data,
      qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig),
      getS3BucketStorageClassFromStorageDriveTier(storageDriveAdvancedWriteOptions?.storageDriveTier),
    );

    return actionResult(void 0);
  };
};

export const getFileWriteBinaryContentsActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [FileActionType.WriteBinaryContents]: getProcessFileWriteBinaryContents(qpqConfig),
});
