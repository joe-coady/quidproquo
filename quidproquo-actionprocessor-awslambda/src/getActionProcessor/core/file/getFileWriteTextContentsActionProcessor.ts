import {
  FileWriteTextContentsActionProcessor,
  actionResult,
  FileActionType,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';

import { resolveStorageDriveBucketName } from './utils';
import { writeTextFile } from '../../../logic/s3/s3Utils';

const getProcessFileWriteTextContents = (
  qpqConfig: QPQConfig,
): FileWriteTextContentsActionProcessor => {
  return async ({ drive, filepath, data }) => {
    const s3BucketName = resolveStorageDriveBucketName(drive, qpqConfig);
    await writeTextFile(
      s3BucketName,
      filepath,
      data,
      qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig),
    );

    return actionResult(void 0);
  };
};

export default (qpqConfig: QPQConfig) => ({
  [FileActionType.WriteTextContents]: getProcessFileWriteTextContents(qpqConfig),
});
