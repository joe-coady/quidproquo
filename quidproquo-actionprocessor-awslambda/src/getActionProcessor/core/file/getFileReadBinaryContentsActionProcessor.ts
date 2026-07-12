import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  composeScopedFilePath,
  FileActionType,
  FileReadBinaryContentsActionProcessor,
  FileReadBinaryContentsErrorTypeEnum,
  QPQConfig,
} from 'quidproquo-core';

import { readBinaryFile } from '../../../logic/s3/s3Utils';
import { resolveStorageDriveBucketName } from './utils';

const getProcessFileReadBinaryContents = (qpqConfig: QPQConfig): FileReadBinaryContentsActionProcessor => {
  return async ({ drive, filepath, scope }) => {
    try {
      const s3BucketName = resolveStorageDriveBucketName(drive, qpqConfig);
      const key = composeScopedFilePath(scope, filepath);

      return actionResult(await readBinaryFile(s3BucketName, key, qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig)));
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        InvalidObjectState: () => actionResultError(FileReadBinaryContentsErrorTypeEnum.InvalidStorageClass, 'File is in the wrong storage class'),
        NoSuchKey: () => actionResultError(FileReadBinaryContentsErrorTypeEnum.FileNotFound, `File not found: ${filepath}`),
        NotFound: () => actionResultError(FileReadBinaryContentsErrorTypeEnum.FileNotFound, `File not found: ${filepath}`),
        InvalidScopeError: (error) => actionResultError(FileReadBinaryContentsErrorTypeEnum.InvalidScope, error.message),
      });
    }
  };
};

export const getFileReadBinaryContentsActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [FileActionType.ReadBinaryContents]: getProcessFileReadBinaryContents(qpqConfig),
});
