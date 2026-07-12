import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  composeScopedFilePath,
  FileActionType,
  FileIsColdStorageActionProcessor,
  FileIsColdStorageErrorTypeEnum,
  QPQConfig,
} from 'quidproquo-core';

import { getObjectStorageClass } from '../../../logic/s3/getObjectStorageClass';
import { resolveStorageDriveBucketName } from './utils';

const getProcessFileIsColdStorage = (qpqConfig: QPQConfig): FileIsColdStorageActionProcessor => {
  return async ({ drive, filepath, scope }) => {
    const s3BucketName = resolveStorageDriveBucketName(drive, qpqConfig);

    try {
      const key = composeScopedFilePath(scope, filepath);
      const isColdStorage =
        (await getObjectStorageClass(s3BucketName, key, qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig))) === 'cold_storage';

      return actionResult(isColdStorage);
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        AccessDenied: () => actionResultError(FileIsColdStorageErrorTypeEnum.AccessDenied, 'Access denied reading file storage class'),
        Forbidden: () => actionResultError(FileIsColdStorageErrorTypeEnum.AccessDenied, 'Access denied reading file storage class'),
        NotFound: () => actionResultError(FileIsColdStorageErrorTypeEnum.FileNotFound, `File not found: ${filepath}`),
        NoSuchKey: () => actionResultError(FileIsColdStorageErrorTypeEnum.FileNotFound, `File not found: ${filepath}`),
        NoSuchBucket: () => actionResultError(FileIsColdStorageErrorTypeEnum.DriveNotFound, `Storage drive not found: ${drive}`),
        InvalidScopeError: (error) => actionResultError(FileIsColdStorageErrorTypeEnum.InvalidScope, error.message),
      });
    }
  };
};

export const getFileIsColdStorageActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [FileActionType.IsColdStorage]: getProcessFileIsColdStorage(qpqConfig),
});
