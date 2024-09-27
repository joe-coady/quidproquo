import {
  FileExistsActionProcessor,
  actionResult,
  FileActionType,
  QPQConfig,
  qpqCoreUtils,
  ActionProcessorListResolver,
  ActionProcessorList,
} from 'quidproquo-core';

import { resolveStorageDriveBucketName } from './utils';
import { objectExists } from '../../../logic/s3/s3Utils';

const getProcessFileExists = (qpqConfig: QPQConfig): FileExistsActionProcessor => {
  return async ({ drive, filepath }) => {
    const s3BucketName = resolveStorageDriveBucketName(drive, qpqConfig);

    return actionResult(await objectExists(s3BucketName, filepath, qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig)));
  };
};

export const getFileExistsActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [FileActionType.Exists]: getProcessFileExists(qpqConfig),
});
