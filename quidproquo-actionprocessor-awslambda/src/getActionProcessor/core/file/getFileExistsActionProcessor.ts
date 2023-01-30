import {
  FileExistsActionProcessor,
  actionResult,
  FileActionType,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';

import { resolveResourceName } from '../../../runtimeConfig/qpqAwsLambdaRuntimeConfigUtils';
import { objectExists } from '../../../logic/s3/s3Utils';

const getProcessFileExists = (qpqConfig: QPQConfig): FileExistsActionProcessor => {
  return async ({ drive, filepath }) => {
    const s3BucketName = resolveResourceName(drive, qpqConfig);

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
