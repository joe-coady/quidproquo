import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  FileActionType,
  FileReadBinaryContentsActionProcessor,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';

import { readBinaryFile } from '../../../logic/s3/s3Utils';
import { resolveStorageDriveBucketName } from './utils';

const getProcessFileReadBinaryContents = (qpqConfig: QPQConfig): FileReadBinaryContentsActionProcessor => {
  return async ({ drive, filepath }) => {
    const s3BucketName = resolveStorageDriveBucketName(drive, qpqConfig);

    return actionResult(await readBinaryFile(s3BucketName, filepath, qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig)));
  };
};

export const getFileReadBinaryContentsActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [FileActionType.ReadBinaryContents]: getProcessFileReadBinaryContents(qpqConfig),
});
