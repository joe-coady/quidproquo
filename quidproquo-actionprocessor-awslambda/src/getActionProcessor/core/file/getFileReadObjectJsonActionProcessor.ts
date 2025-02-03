import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  FileActionType,
  FileReadObjectJsonActionProcessor,
  FileReadObjectJsonErrorTypeEnum,
  QPQConfig,
} from 'quidproquo-core';

import { readTextFile } from '../../../logic/s3/s3Utils';
import { resolveStorageDriveBucketName } from './utils';

const getProcessFileReadObjectJson = (qpqConfig: QPQConfig): FileReadObjectJsonActionProcessor<object> => {
  return async ({ drive, filepath }) => {
    try {
      const s3BucketName = resolveStorageDriveBucketName(drive, qpqConfig);

      const json = await readTextFile(s3BucketName, filepath, qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig));

      const obj = JSON.parse(json);

      return actionResult(obj);
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        InvalidObjectState: () => actionResultError(FileReadObjectJsonErrorTypeEnum.InvalidStorageClass, 'File is in the wrong storage class'),
      });
    }
  };
};

export const getFileReadObjectJsonActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [FileActionType.ReadObjectJson]: getProcessFileReadObjectJson(qpqConfig),
});
