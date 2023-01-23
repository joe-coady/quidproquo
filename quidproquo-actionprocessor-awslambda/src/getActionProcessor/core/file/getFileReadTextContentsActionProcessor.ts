import {
  FileReadTextContentsActionProcessor,
  actionResult,
  FileActionType,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';

import { resolveResourceName } from '../../../runtimeConfig/qpqAwsLambdaRuntimeConfigUtils';
import { readTextFile } from '../../../logic/s3/s3Utils';

const getProcessFileReadTextContents = (
  qpqConfig: QPQConfig,
): FileReadTextContentsActionProcessor => {
  return async ({ drive, filepath }) => {
    const s3BucketName = resolveResourceName(drive, qpqConfig);

    return actionResult(
      await readTextFile(s3BucketName, filepath, qpqCoreUtils.getDeployRegion(qpqConfig)),
    );
  };
};

export default (qpqConfig: QPQConfig) => ({
  [FileActionType.ReadTextContents]: getProcessFileReadTextContents(qpqConfig),
});
