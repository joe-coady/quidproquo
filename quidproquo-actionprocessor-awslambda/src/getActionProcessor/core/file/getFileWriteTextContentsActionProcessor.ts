import { QPQAWSLambdaConfig } from '../../../runtimeConfig/QPQAWSLambdaConfig';
import { resolveResourceName } from '../../../runtimeConfig/qpqAwsLambdaRuntimeConfigUtils';
import {
  FileWriteTextContentsActionProcessor,
  actionResult,
  FileActionType,
} from 'quidproquo-core';
import { writeTextFile } from '../../../logic/s3/s3Utils';

const getProcessFileWriteTextContents = (
  runtimeConfig: QPQAWSLambdaConfig,
): FileWriteTextContentsActionProcessor => {
  return async ({ drive, filepath, data }) => {
    const s3BucketName = resolveResourceName(drive, runtimeConfig);
    await writeTextFile(s3BucketName, filepath, data);

    return actionResult(void 0);
  };
};

export default (runtimeConfig: QPQAWSLambdaConfig) => ({
  [FileActionType.WriteTextContents]: getProcessFileWriteTextContents(runtimeConfig),
});
