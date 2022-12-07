import { QPQAWSLambdaConfig } from '../../../runtimeConfig/QPQAWSLambdaConfig';
import { resolveResourceName } from '../../../runtimeConfig/qpqAwsLambdaRuntimeConfigUtils';
import { FileListDirectoryActionProcessor, actionResult, FileActionType } from 'quidproquo-core';
import { listFiles } from '../../../logic/s3/s3Utils';

const getProcessFileListDirectory = (
  runtimeConfig: QPQAWSLambdaConfig,
): FileListDirectoryActionProcessor => {
  return async ({ drive, folderPath }) => {
    const s3BucketName = resolveResourceName(drive, runtimeConfig);
    const s3FileInfos = await listFiles(s3BucketName, folderPath);
    const fileInfos = s3FileInfos.map((s3fi) => ({
      ...s3fi,
      drive: drive,
    }));

    return actionResult(fileInfos);
  };
};

export default (runtimeConfig: QPQAWSLambdaConfig) => ({
  [FileActionType.ListDirectory]: getProcessFileListDirectory(runtimeConfig),
});
