import {
  FileReadTextContentsActionProcessor,
  actionResult,
  FileActionType,
  QPQConfig,
} from 'quidproquo-core';
import { qpqWebServerUtils } from 'quidproquo-webserver';

import { QPQAWSResourceMap } from '../../../runtimeConfig/QPQAWSResourceMap';
import { resolveResourceName } from '../../../runtimeConfig/qpqAwsLambdaRuntimeConfigUtils';
import { readTextFile } from '../../../logic/s3/s3Utils';

const getProcessFileReadTextContents = (
  qpqConfig: QPQConfig,
  awsResourceMap: QPQAWSResourceMap,
): FileReadTextContentsActionProcessor => {
  return async ({ drive, filepath }) => {
    const s3BucketName = resolveResourceName(drive, awsResourceMap);

    return actionResult(
      await readTextFile(s3BucketName, filepath, qpqWebServerUtils.getDeployRegion(qpqConfig)),
    );
  };
};

export default (qpqConfig: QPQConfig, awsResourceMap: QPQAWSResourceMap) => ({
  [FileActionType.ReadTextContents]: getProcessFileReadTextContents(qpqConfig, awsResourceMap),
});
