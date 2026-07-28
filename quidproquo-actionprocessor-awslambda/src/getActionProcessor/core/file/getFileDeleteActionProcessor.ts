import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import { ActionProcessorList, ActionProcessorListResolver, QPQConfig } from 'quidproquo-core';
import {
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  composeScopedFilePath,
  FileActionType,
  FileDeleteActionProcessor,
  FileDeleteErrorTypeEnum,
} from 'quidproquo-core';

import { deleteFiles } from '../../../logic/s3/s3Utils';
import { resolveStorageDriveBucketName } from './utils';

const getProcessFileDelete = (qpqConfig: QPQConfig): FileDeleteActionProcessor => {
  return async ({ drive, filepaths, scope }) => {
    try {
      const s3BucketName = resolveStorageDriveBucketName(drive, qpqConfig);
      const keys = filepaths.map((filepath) => composeScopedFilePath(scope, filepath));

      // Per-file delete failures come back as a normal result (the keys that
      // errored) so callers can retry them; only whole-call failures error.
      const errored = await deleteFiles(s3BucketName, keys, qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig));

      return actionResult(errored);
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        AccessDenied: () => actionResultError(FileDeleteErrorTypeEnum.AccessDenied, 'Access denied deleting files'),
        NoSuchBucket: () => actionResultError(FileDeleteErrorTypeEnum.DriveNotFound, `Storage drive not found: ${drive}`),
        StorageDriveNotFoundError: (error) => actionResultError(FileDeleteErrorTypeEnum.DriveNotFound, error.message),
        InvalidScopeError: (error) => actionResultError(FileDeleteErrorTypeEnum.InvalidScope, error.message),
      });
    }
  };
};

export const getFileDeleteActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [FileActionType.Delete]: getProcessFileDelete(qpqConfig),
});
