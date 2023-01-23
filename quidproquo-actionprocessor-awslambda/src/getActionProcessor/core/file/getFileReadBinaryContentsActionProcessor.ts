import {
  FileReadBinaryContentsActionProcessor,
  actionResult,
  FileActionType,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';

import { resolveResourceName } from '../../../runtimeConfig/qpqAwsLambdaRuntimeConfigUtils';
import { readBinaryFile } from '../../../logic/s3/s3Utils';

const getProcessFileReadBinaryContents = (
  qpqConfig: QPQConfig,
): FileReadBinaryContentsActionProcessor => {
  return async ({ drive, filepath }) => {
    const s3BucketName = resolveResourceName(drive, qpqConfig);

    return actionResult(
      await readBinaryFile(s3BucketName, filepath, qpqCoreUtils.getDeployRegion(qpqConfig)),
    );
  };
};

export default (qpqConfig: QPQConfig) => ({
  [FileActionType.ReadBinaryContents]: getProcessFileReadBinaryContents(qpqConfig),
});
