import {
  FileExistsActionProcessor,
  actionResult,
  FileActionType,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';

import { resolveStorageDriveBucketName } from './utils';
import { objectExists } from '../../../logic/s3/s3Utils';

const getProcessFileExists = (qpqConfig: QPQConfig): FileExistsActionProcessor => {
  return async ({ drive, filepath }) => {
    const s3BucketName = resolveStorageDriveBucketName(drive, qpqConfig);

    return actionResult(
      await objectExists(
        s3BucketName,
        filepath,
        qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig),
      ),
    );
  };
};

export default (qpqConfig: QPQConfig) => ({
  [FileActionType.Exists]: getProcessFileExists(qpqConfig),
});
