import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  FileActionType,
  FileReadTextContentsActionProcessor,
  FileReadTextContentsErrorTypeEnum,
  QPQConfig,
} from 'quidproquo-core';

import { readTextFile } from '../../../logic/s3/s3Utils';
import { resolveStorageDriveBucketName } from './utils';

const getProcessFileReadTextContents = (qpqConfig: QPQConfig): FileReadTextContentsActionProcessor => {
  return async ({ drive, filepath }) => {
    try {
      const s3BucketName = resolveStorageDriveBucketName(drive, qpqConfig);

      return actionResult(await readTextFile(s3BucketName, filepath, qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig)));
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        InvalidObjectState: () => actionResultError(FileReadTextContentsErrorTypeEnum.InvalidStorageClass, 'File is in the wrong storage class'),
      });
    }
  };
};

export const getFileReadTextContentsActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [FileActionType.ReadTextContents]: getProcessFileReadTextContents(qpqConfig),
});
