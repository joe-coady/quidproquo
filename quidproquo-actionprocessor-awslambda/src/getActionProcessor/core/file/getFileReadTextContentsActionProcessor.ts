import { QPQAWSLambdaConfig } from '../../../runtimeConfig/QPQAWSLambdaConfig';
import { resolveResourceName } from '../../../runtimeConfig/qpqAwsLambdaRuntimeConfigUtils';
import { FileReadTextContentsActionProcessor, actionResult, FileActionType } from 'quidproquo-core';
import { readTextFile } from '../../../logic/s3/s3Utils';

const getProcessFileReadTextContents = (
  runtimeConfig: QPQAWSLambdaConfig,
): FileReadTextContentsActionProcessor => {
  return async ({ drive, filepath }) => {
    const s3BucketName = resolveResourceName(drive, runtimeConfig);

    return actionResult(await readTextFile(s3BucketName, filepath));
  };
};

export default (runtimeConfig: QPQAWSLambdaConfig) => ({
  [FileActionType.ReadTextContents]: getProcessFileReadTextContents(runtimeConfig),
});
