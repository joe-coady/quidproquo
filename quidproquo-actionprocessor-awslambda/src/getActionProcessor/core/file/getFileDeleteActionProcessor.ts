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
    const s3BucketName = resolveStorageDriveBucketName(drive, qpqConfig);

    try {
      const keys = filepaths.map((filepath) => composeScopedFilePath(scope, filepath));
      const errored = await deleteFiles(s3BucketName, keys, qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig));

      // errored deletes are a graceful success ~ Retry
      // if (errored.length > 0) {
      //   return actionResultError(
      //     ErrorTypeEnum.GenericError,
      //     `Could not delete files ${errored.length}`,
      //   );
      // }

      return actionResult(errored);
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        AccessDenied: () => actionResultError(FileDeleteErrorTypeEnum.AccessDenied, 'Access denied deleting files'),
        NoSuchBucket: () => actionResultError(FileDeleteErrorTypeEnum.DriveNotFound, `Storage drive not found: ${drive}`),
        InvalidScopeError: (error) => actionResultError(FileDeleteErrorTypeEnum.InvalidScope, error.message),
      });
    }
  };
};

export const getFileDeleteActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [FileActionType.Delete]: getProcessFileDelete(qpqConfig),
});
