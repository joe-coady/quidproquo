import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  composeScopedFilePath,
  FileActionType,
  FileReadTextContentsActionProcessor,
  FileReadTextContentsErrorTypeEnum,
  QPQConfig,
} from 'quidproquo-core';

import { readTextFile } from '../../../logic/s3/s3Utils';
import { resolveStorageDriveBucketName } from './utils';

const getProcessFileReadTextContents = (qpqConfig: QPQConfig): FileReadTextContentsActionProcessor => {
  return async ({ drive, filepath, scope }) => {
    try {
      const s3BucketName = resolveStorageDriveBucketName(drive, qpqConfig);
      const key = composeScopedFilePath(scope, filepath);

      return actionResult(await readTextFile(s3BucketName, key, qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig)));
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        InvalidObjectState: () => actionResultError(FileReadTextContentsErrorTypeEnum.InvalidStorageClass, 'File is in the wrong storage class'),
        InvalidScopeError: (error) => actionResultError(FileReadTextContentsErrorTypeEnum.InvalidScope, error.message),
      });
    }
  };
};

export const getFileReadTextContentsActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [FileActionType.ReadTextContents]: getProcessFileReadTextContents(qpqConfig),
});
