import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  FileActionType,
  FileReadTextContentsActionProcessor,
  QPQConfig,
} from 'quidproquo-core';

import { readTextFile } from '../../../logic/s3/s3Utils';
import { resolveStorageDriveBucketName } from './utils';

const getProcessFileReadTextContents = (qpqConfig: QPQConfig): FileReadTextContentsActionProcessor => {
  return async ({ drive, filepath }) => {
    const s3BucketName = resolveStorageDriveBucketName(drive, qpqConfig);

    return actionResult(await readTextFile(s3BucketName, filepath, qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig)));
  };
};

export const getFileReadTextContentsActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [FileActionType.ReadTextContents]: getProcessFileReadTextContents(qpqConfig),
});
