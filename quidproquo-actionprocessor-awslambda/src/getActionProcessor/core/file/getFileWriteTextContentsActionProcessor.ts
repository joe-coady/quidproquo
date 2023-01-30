import {
  FileWriteTextContentsActionProcessor,
  actionResult,
  FileActionType,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';

import { resolveResourceName } from '../../../runtimeConfig/qpqAwsLambdaRuntimeConfigUtils';
import { writeTextFile } from '../../../logic/s3/s3Utils';

const getProcessFileWriteTextContents = (
  qpqConfig: QPQConfig,
): FileWriteTextContentsActionProcessor => {
  return async ({ drive, filepath, data }) => {
    const s3BucketName = resolveResourceName(drive, qpqConfig);
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
