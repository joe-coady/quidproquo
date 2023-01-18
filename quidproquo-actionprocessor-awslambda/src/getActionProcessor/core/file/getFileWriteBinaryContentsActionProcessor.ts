import {
  FileWriteBinaryContentsActionProcessor,
  actionResult,
  FileActionType,
  QPQConfig,
} from 'quidproquo-core';
import { qpqWebServerUtils } from 'quidproquo-webserver';

import { QPQAWSResourceMap } from '../../../runtimeConfig/QPQAWSResourceMap';
import { resolveResourceName } from '../../../runtimeConfig/qpqAwsLambdaRuntimeConfigUtils';
import { writeBinaryFile } from '../../../logic/s3/s3Utils';

const getProcessFileWriteBinaryContents = (
  qpqConfig: QPQConfig,
  awsResourceMap: QPQAWSResourceMap,
): FileWriteBinaryContentsActionProcessor => {
  return async ({ drive, filepath, data }) => {
    const s3BucketName = resolveResourceName(drive, awsResourceMap);
    await writeBinaryFile(
      s3BucketName,
      filepath,
      data,
      qpqWebServerUtils.getDeployRegion(qpqConfig),
    );

    return actionResult(void 0);
  };
};

export default (qpqConfig: QPQConfig, awsResourceMap: QPQAWSResourceMap) => ({
  [FileActionType.WriteBinaryContents]: getProcessFileWriteBinaryContents(
    qpqConfig,
    awsResourceMap,
  ),
});
