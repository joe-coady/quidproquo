import {
  FileWriteTextContentsActionProcessor,
  actionResult,
  FileActionType,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';

import { QPQAWSResourceMap } from '../../../runtimeConfig/QPQAWSResourceMap';
import { resolveResourceName } from '../../../runtimeConfig/qpqAwsLambdaRuntimeConfigUtils';
import { writeTextFile } from '../../../logic/s3/s3Utils';

const getProcessFileWriteTextContents = (
  qpqConfig: QPQConfig,
  awsResourceMap: QPQAWSResourceMap,
): FileWriteTextContentsActionProcessor => {
  return async ({ drive, filepath, data }) => {
    const s3BucketName = resolveResourceName(drive, awsResourceMap);
    await writeTextFile(s3BucketName, filepath, data, qpqCoreUtils.getDeployRegion(qpqConfig));

    return actionResult(void 0);
  };
};

export default (qpqConfig: QPQConfig, awsResourceMap: QPQAWSResourceMap) => ({
  [FileActionType.WriteTextContents]: getProcessFileWriteTextContents(qpqConfig, awsResourceMap),
});
