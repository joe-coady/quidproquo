import { QPQConfig } from 'quidproquo-core';
import { qpqWebServerUtils } from 'quidproquo-webserver';
import { QPQAWSResourceMap } from '../../../runtimeConfig/QPQAWSResourceMap';
import { resolveResourceName } from '../../../runtimeConfig/qpqAwsLambdaRuntimeConfigUtils';
import {
  FileDeleteActionProcessor,
  actionResult,
  actionResultError,
  FileActionType,
  ErrorTypeEnum,
} from 'quidproquo-core';
import { deleteFiles } from '../../../logic/s3/s3Utils';

const getProcessFileDelete = (
  qpqConfig: QPQConfig,
  awsResourceMap: QPQAWSResourceMap,
): FileDeleteActionProcessor => {
  return async ({ drive, filepaths }) => {
    const s3BucketName = resolveResourceName(drive, awsResourceMap);
    const errored = await deleteFiles(
      s3BucketName,
      filepaths,
      qpqWebServerUtils.getDeployRegion(qpqConfig),
    );

    // errored deletes are a graceful success ~ Retry
    // if (errored.length > 0) {
    //   return actionResultError(
    //     ErrorTypeEnum.GenericError,
    //     `Could not delete files ${errored.length}`,
    //   );
    // }

    return actionResult(errored);
  };
};

export default (qpqConfig: QPQConfig, awsResourceMap: QPQAWSResourceMap) => ({
  [FileActionType.Delete]: getProcessFileDelete(qpqConfig, awsResourceMap),
});
