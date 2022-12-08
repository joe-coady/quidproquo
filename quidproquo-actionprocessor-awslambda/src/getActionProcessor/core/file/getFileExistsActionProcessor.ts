import { QPQAWSLambdaConfig } from '../../../runtimeConfig/QPQAWSLambdaConfig';
import { resolveResourceName } from '../../../runtimeConfig/qpqAwsLambdaRuntimeConfigUtils';
import { FileExistsActionProcessor, actionResult, FileActionType } from 'quidproquo-core';
import { objectExists } from '../../../logic/s3/s3Utils';

const getProcessFileExists = (runtimeConfig: QPQAWSLambdaConfig): FileExistsActionProcessor => {
  return async ({ drive, filepath }) => {
    const s3BucketName = resolveResourceName(drive, runtimeConfig);

    return actionResult(await objectExists(s3BucketName, filepath));
  };
};

export default (runtimeConfig: QPQAWSLambdaConfig) => ({
  [FileActionType.Exists]: getProcessFileExists(runtimeConfig),
});
