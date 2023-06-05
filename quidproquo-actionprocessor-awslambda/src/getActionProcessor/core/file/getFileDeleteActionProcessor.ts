import { QPQConfig, qpqCoreUtils } from 'quidproquo-core';

import { FileDeleteActionProcessor, actionResult, FileActionType } from 'quidproquo-core';
import { deleteFiles } from '../../../logic/s3/s3Utils';
import { resolveStorageDriveBucketName } from './utils';

const getProcessFileDelete = (qpqConfig: QPQConfig): FileDeleteActionProcessor => {
  return async ({ drive, filepaths }) => {
    const s3BucketName = resolveStorageDriveBucketName(drive, qpqConfig);
    const errored = await deleteFiles(
      s3BucketName,
      filepaths,
      qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig),
    );

    // errored deletes are a graceful success ~ Retry
    // if (errored.length > 0) {
    //   return actionResultError(
    //     ErrorTypeEnum.GenericError,
    //     `Could not delete files ${errored.length}`,
    //   );
    // }

    return actionResult(errored);
  };
};

export default (qpqConfig: QPQConfig) => ({
  [FileActionType.Delete]: getProcessFileDelete(qpqConfig),
});
