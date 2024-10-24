import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  FileActionType,
  FileExistsActionProcessor,
  QPQConfig,
} from 'quidproquo-core';

import { objectExists } from '../../../logic/s3/s3Utils';
import { resolveStorageDriveBucketName } from './utils';

const getProcessFileExists = (qpqConfig: QPQConfig): FileExistsActionProcessor => {
  return async ({ drive, filepath }) => {
    const s3BucketName = resolveStorageDriveBucketName(drive, qpqConfig);

    return actionResult(await objectExists(s3BucketName, filepath, qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig)));
  };
};

export const getFileExistsActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [FileActionType.Exists]: getProcessFileExists(qpqConfig),
});
