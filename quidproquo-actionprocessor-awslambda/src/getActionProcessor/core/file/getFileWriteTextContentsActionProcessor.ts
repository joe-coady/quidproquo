import {
  FileWriteTextContentsActionProcessor,
  actionResult,
  FileActionType,
  QPQConfig,
  qpqCoreUtils,
  ActionProcessorListResolver,
  ActionProcessorList,
} from 'quidproquo-core';

import { resolveStorageDriveBucketName } from './utils';
import { writeTextFile } from '../../../logic/s3/s3Utils';
import { getS3BucketStorageClassFromStorageDriveTier } from '../../../awsLambdaUtils';

const getProcessFileWriteTextContents = (qpqConfig: QPQConfig): FileWriteTextContentsActionProcessor => {
  return async ({ drive, filepath, data, storageDriveAdvancedWriteOptions }) => {
    const s3BucketName = resolveStorageDriveBucketName(drive, qpqConfig);

    await writeTextFile(
      s3BucketName,
      filepath,
      data,
      qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig),
      getS3BucketStorageClassFromStorageDriveTier(storageDriveAdvancedWriteOptions?.storageDriveTier),
    );

    return actionResult(void 0);
  };
};

export const getFileWriteTextContentsActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [FileActionType.WriteTextContents]: getProcessFileWriteTextContents(qpqConfig),
});
