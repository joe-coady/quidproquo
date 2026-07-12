import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  composeScopedFilePath,
  FileActionType,
  FileExistsActionProcessor,
  FileExistsErrorTypeEnum,
  QPQConfig,
} from 'quidproquo-core';

import { objectExists } from '../../../logic/s3/s3Utils';
import { resolveStorageDriveBucketName } from './utils';

const getProcessFileExists = (qpqConfig: QPQConfig): FileExistsActionProcessor => {
  return async ({ drive, filepath, scope }) => {
    const s3BucketName = resolveStorageDriveBucketName(drive, qpqConfig);

    try {
      const key = composeScopedFilePath(scope, filepath);
      return actionResult(await objectExists(s3BucketName, key, qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig)));
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        AccessDenied: () => actionResultError(FileExistsErrorTypeEnum.AccessDenied, 'Access denied checking file existence'),
        Forbidden: () => actionResultError(FileExistsErrorTypeEnum.AccessDenied, 'Access denied checking file existence'),
        InvalidScopeError: (error) => actionResultError(FileExistsErrorTypeEnum.InvalidScope, error.message),
      });
    }
  };
};

export const getFileExistsActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [FileActionType.Exists]: getProcessFileExists(qpqConfig),
});
