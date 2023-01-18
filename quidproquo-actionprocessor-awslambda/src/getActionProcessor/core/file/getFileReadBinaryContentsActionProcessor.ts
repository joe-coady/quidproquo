import {
  FileReadBinaryContentsActionProcessor,
  actionResult,
  FileActionType,
  QPQConfig,
} from 'quidproquo-core';
import { qpqWebServerUtils } from 'quidproquo-webserver';

import { QPQAWSResourceMap } from '../../../runtimeConfig/QPQAWSResourceMap';
import { resolveResourceName } from '../../../runtimeConfig/qpqAwsLambdaRuntimeConfigUtils';
import { readBinaryFile } from '../../../logic/s3/s3Utils';

const getProcessFileReadBinaryContents = (
  qpqConfig: QPQConfig,
  awsResourceMap: QPQAWSResourceMap,
): FileReadBinaryContentsActionProcessor => {
  return async ({ drive, filepath }) => {
    const s3BucketName = resolveResourceName(drive, awsResourceMap);

    return actionResult(
      await readBinaryFile(s3BucketName, filepath, qpqWebServerUtils.getDeployRegion(qpqConfig)),
    );
  };
};

export default (qpqConfig: QPQConfig, awsResourceMap: QPQAWSResourceMap) => ({
  [FileActionType.ReadBinaryContents]: getProcessFileReadBinaryContents(qpqConfig, awsResourceMap),
});
