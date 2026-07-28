import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  composeScopedFilePath,
  FileActionType,
  FileWriteObjectJsonActionProcessor,
  FileWriteObjectJsonErrorTypeEnum,
  QPQConfig,
} from 'quidproquo-core';

import { getS3BucketStorageClassFromStorageDriveTier } from '../../../awsLambdaUtils';
import { writeTextFile } from '../../../logic/s3/s3Utils';
import { resolveStorageDriveBucketName } from './utils';

const getProcessFileWriteObjectJson = (qpqConfig: QPQConfig): FileWriteObjectJsonActionProcessor<object> => {
  return async ({ drive, filepath, data, storageDriveAdvancedWriteOptions, scope }) => {
    const dataJson = JSON.stringify(data);

    try {
      const s3BucketName = resolveStorageDriveBucketName(drive, qpqConfig);
      await writeTextFile(
        s3BucketName,
        composeScopedFilePath(scope, filepath),
        dataJson,
        qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig),
        getS3BucketStorageClassFromStorageDriveTier(storageDriveAdvancedWriteOptions?.storageDriveTier),
      );

      return actionResult(void 0);
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        AccessDenied: () => actionResultError(FileWriteObjectJsonErrorTypeEnum.AccessDenied, 'Access denied writing file'),
        Forbidden: () => actionResultError(FileWriteObjectJsonErrorTypeEnum.AccessDenied, 'Access denied writing file'),
        NoSuchBucket: () => actionResultError(FileWriteObjectJsonErrorTypeEnum.DriveNotFound, `Storage drive not found: ${drive}`),
        StorageDriveNotFoundError: (error) => actionResultError(FileWriteObjectJsonErrorTypeEnum.DriveNotFound, error.message),
        InvalidScopeError: (error) => actionResultError(FileWriteObjectJsonErrorTypeEnum.InvalidScope, error.message),
      });
    }
  };
};

export const getFileWriteObjectJsonActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [FileActionType.WriteObjectJson]: getProcessFileWriteObjectJson(qpqConfig),
});
