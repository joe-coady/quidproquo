import {
  FileWriteBinaryContentsActionProcessor,
  actionResult,
  FileActionType,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';

import { resolveStorageDriveBucketName } from './utils';
import { writeBinaryFile } from '../../../logic/s3/s3Utils';

const getProcessFileWriteBinaryContents = (
  qpqConfig: QPQConfig,
): FileWriteBinaryContentsActionProcessor => {
  return async ({ drive, filepath, data }) => {
    const s3BucketName = resolveStorageDriveBucketName(drive, qpqConfig);
    await writeBinaryFile(
      s3BucketName,
      filepath,
      data,
      qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig),
    );

    return actionResult(void 0);
  };
};

export default (qpqConfig: QPQConfig) => ({
  [FileActionType.WriteBinaryContents]: getProcessFileWriteBinaryContents(qpqConfig),
});
