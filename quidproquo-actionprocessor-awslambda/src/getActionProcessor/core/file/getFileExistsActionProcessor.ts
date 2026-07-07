import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  FileActionType,
  FileExistsActionProcessor,
  FileExistsErrorTypeEnum,
  QPQConfig,
} from 'quidproquo-core';

import { objectExists } from '../../../logic/s3/s3Utils';
import { resolveStorageDriveBucketName } from './utils';

const getProcessFileExists = (qpqConfig: QPQConfig): FileExistsActionProcessor => {
  return async ({ drive, filepath }) => {
    const s3BucketName = resolveStorageDriveBucketName(drive, qpqConfig);

    try {
      return actionResult(await objectExists(s3BucketName, filepath, qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig)));
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        AccessDenied: () => actionResultError(FileExistsErrorTypeEnum.AccessDenied, 'Access denied checking file existence'),
        Forbidden: () => actionResultError(FileExistsErrorTypeEnum.AccessDenied, 'Access denied checking file existence'),
      });
    }
  };
};

export const getFileExistsActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [FileActionType.Exists]: getProcessFileExists(qpqConfig),
});
