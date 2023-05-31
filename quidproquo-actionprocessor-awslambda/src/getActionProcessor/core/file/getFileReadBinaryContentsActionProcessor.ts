import {
  FileReadBinaryContentsActionProcessor,
  actionResult,
  FileActionType,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';

import { resolveStorageDriveBucketName } from './utils';
import { readBinaryFile } from '../../../logic/s3/s3Utils';

const getProcessFileReadBinaryContents = (
  qpqConfig: QPQConfig,
): FileReadBinaryContentsActionProcessor => {
  return async ({ drive, filepath }) => {
    const s3BucketName = resolveStorageDriveBucketName(drive, qpqConfig);

    return actionResult(
      await readBinaryFile(
        s3BucketName,
        filepath,
        qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig),
      ),
    );
  };
};

export default (qpqConfig: QPQConfig) => ({
  [FileActionType.ReadBinaryContents]: getProcessFileReadBinaryContents(qpqConfig),
});
