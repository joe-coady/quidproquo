import {
  FileReadBinaryContentsActionProcessor,
  actionResult,
  FileActionType,
} from 'quidproquo-core';
import { qpqWebServerUtils } from 'quidproquo-webserver';

import { QPQAWSLambdaConfig } from '../../../runtimeConfig/QPQAWSLambdaConfig';
import { resolveResourceName } from '../../../runtimeConfig/qpqAwsLambdaRuntimeConfigUtils';
import { readBinaryFile } from '../../../logic/s3/s3Utils';

const getProcessFileReadBinaryContents = (
  runtimeConfig: QPQAWSLambdaConfig,
): FileReadBinaryContentsActionProcessor => {
  return async ({ drive, filepath }) => {
    const s3BucketName = resolveResourceName(drive, runtimeConfig);

    return actionResult(
      await readBinaryFile(
        s3BucketName,
        filepath,
        qpqWebServerUtils.getDeployRegion(runtimeConfig.qpqConfig),
      ),
    );
  };
};

export default (runtimeConfig: QPQAWSLambdaConfig) => ({
  [FileActionType.ReadBinaryContents]: getProcessFileReadBinaryContents(runtimeConfig),
});
