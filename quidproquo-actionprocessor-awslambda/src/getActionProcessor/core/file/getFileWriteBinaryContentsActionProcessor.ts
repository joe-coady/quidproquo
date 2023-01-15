import {
  FileWriteBinaryContentsActionProcessor,
  actionResult,
  FileActionType,
} from 'quidproquo-core';
import { qpqWebServerUtils } from 'quidproquo-webserver';

import { QPQAWSLambdaConfig } from '../../../runtimeConfig/QPQAWSLambdaConfig';
import { resolveResourceName } from '../../../runtimeConfig/qpqAwsLambdaRuntimeConfigUtils';
import { writeBinaryFile } from '../../../logic/s3/s3Utils';

const getProcessFileWriteBinaryContents = (
  runtimeConfig: QPQAWSLambdaConfig,
): FileWriteBinaryContentsActionProcessor => {
  return async ({ drive, filepath, data }) => {
    const s3BucketName = resolveResourceName(drive, runtimeConfig);
    await writeBinaryFile(
      s3BucketName,
      filepath,
      data,
      qpqWebServerUtils.getDeployRegion(runtimeConfig.qpqConfig),
    );

    return actionResult(void 0);
  };
};

export default (runtimeConfig: QPQAWSLambdaConfig) => ({
  [FileActionType.WriteBinaryContents]: getProcessFileWriteBinaryContents(runtimeConfig),
});
