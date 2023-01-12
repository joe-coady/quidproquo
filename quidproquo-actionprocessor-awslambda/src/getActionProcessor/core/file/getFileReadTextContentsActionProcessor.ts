import { FileReadTextContentsActionProcessor, actionResult, FileActionType } from 'quidproquo-core';
import { qpqWebServerUtils } from 'quidproquo-webserver';

import { QPQAWSLambdaConfig } from '../../../runtimeConfig/QPQAWSLambdaConfig';
import { resolveResourceName } from '../../../runtimeConfig/qpqAwsLambdaRuntimeConfigUtils';
import { readTextFile } from '../../../logic/s3/s3Utils';

const getProcessFileReadTextContents = (
  runtimeConfig: QPQAWSLambdaConfig,
): FileReadTextContentsActionProcessor => {
  return async ({ drive, filepath }) => {
    const s3BucketName = resolveResourceName(drive, runtimeConfig);

    return actionResult(
      await readTextFile(
        s3BucketName,
        filepath,
        qpqWebServerUtils.getDeployRegion(runtimeConfig.qpqConfig),
      ),
    );
  };
};

export default (runtimeConfig: QPQAWSLambdaConfig) => ({
  [FileActionType.ReadTextContents]: getProcessFileReadTextContents(runtimeConfig),
});
