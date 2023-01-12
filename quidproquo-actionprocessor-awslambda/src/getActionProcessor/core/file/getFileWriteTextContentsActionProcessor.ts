import {
  FileWriteTextContentsActionProcessor,
  actionResult,
  FileActionType,
} from 'quidproquo-core';
import { qpqWebServerUtils } from 'quidproquo-webserver';

import { QPQAWSLambdaConfig } from '../../../runtimeConfig/QPQAWSLambdaConfig';
import { resolveResourceName } from '../../../runtimeConfig/qpqAwsLambdaRuntimeConfigUtils';
import { writeTextFile } from '../../../logic/s3/s3Utils';

const getProcessFileWriteTextContents = (
  runtimeConfig: QPQAWSLambdaConfig,
): FileWriteTextContentsActionProcessor => {
  return async ({ drive, filepath, data }) => {
    const s3BucketName = resolveResourceName(drive, runtimeConfig);
    await writeTextFile(
      s3BucketName,
      filepath,
      data,
      qpqWebServerUtils.getDeployRegion(runtimeConfig.qpqConfig),
    );

    return actionResult(void 0);
  };
};

export default (runtimeConfig: QPQAWSLambdaConfig) => ({
  [FileActionType.WriteTextContents]: getProcessFileWriteTextContents(runtimeConfig),
});
