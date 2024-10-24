import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  FileActionType,
  FileWriteTextContentsActionProcessor,
  QPQConfig,
} from 'quidproquo-core';

import { getS3BucketStorageClassFromStorageDriveTier } from '../../../awsLambdaUtils';
import { writeTextFile } from '../../../logic/s3/s3Utils';
import { resolveStorageDriveBucketName } from './utils';

const getProcessFileWriteTextContents = (qpqConfig: QPQConfig): FileWriteTextContentsActionProcessor => {
  return async ({ drive, filepath, data, storageDriveAdvancedWriteOptions }) => {
    const s3BucketName = resolveStorageDriveBucketName(drive, qpqConfig);

    await writeTextFile(
      s3BucketName,
      filepath,
      data,
      qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig),
      getS3BucketStorageClassFromStorageDriveTier(storageDriveAdvancedWriteOptions?.storageDriveTier),
    );

    return actionResult(void 0);
  };
};

export const getFileWriteTextContentsActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [FileActionType.WriteTextContents]: getProcessFileWriteTextContents(qpqConfig),
});
