import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  FileActionType,
  FileWriteObjectJsonActionProcessor,
  QPQConfig,
} from 'quidproquo-core';

import { getS3BucketStorageClassFromStorageDriveTier } from '../../../awsLambdaUtils';
import { writeTextFile } from '../../../logic/s3/s3Utils';
import { resolveStorageDriveBucketName } from './utils';

const getProcessFileWriteObjectJson = (qpqConfig: QPQConfig): FileWriteObjectJsonActionProcessor<object> => {
  return async ({ drive, filepath, data, storageDriveAdvancedWriteOptions }) => {
    const s3BucketName = resolveStorageDriveBucketName(drive, qpqConfig);

    const dataJson = JSON.stringify(data);

    await writeTextFile(
      s3BucketName,
      filepath,
      dataJson,
      qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig),
      getS3BucketStorageClassFromStorageDriveTier(storageDriveAdvancedWriteOptions?.storageDriveTier),
    );

    return actionResult(void 0);
  };
};

export const getFileWriteObjectJsonActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [FileActionType.WriteObjectJson]: getProcessFileWriteObjectJson(qpqConfig),
});
