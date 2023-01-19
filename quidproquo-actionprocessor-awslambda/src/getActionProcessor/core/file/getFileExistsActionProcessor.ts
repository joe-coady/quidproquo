import {
  FileExistsActionProcessor,
  actionResult,
  FileActionType,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';

import { QPQAWSResourceMap } from '../../../runtimeConfig/QPQAWSResourceMap';
import { resolveResourceName } from '../../../runtimeConfig/qpqAwsLambdaRuntimeConfigUtils';
import { objectExists } from '../../../logic/s3/s3Utils';

const getProcessFileExists = (
  qpqConfig: QPQConfig,
  awsResourceMap: QPQAWSResourceMap,
): FileExistsActionProcessor => {
  return async ({ drive, filepath }) => {
    const s3BucketName = resolveResourceName(drive, awsResourceMap);

    return actionResult(
      await objectExists(s3BucketName, filepath, qpqCoreUtils.getDeployRegion(qpqConfig)),
    );
  };
};

export default (qpqConfig: QPQConfig, awsResourceMap: QPQAWSResourceMap) => ({
  [FileActionType.Exists]: getProcessFileExists(qpqConfig, awsResourceMap),
});
