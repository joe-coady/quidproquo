import { QPQAWSLambdaConfig } from '../../../runtimeConfig/QPQAWSLambdaConfig';
import { resolveResourceName } from '../../../runtimeConfig/qpqAwsLambdaRuntimeConfigUtils';
import { FileListDirectoryActionProcessor, actionResult, FileActionType } from 'quidproquo-core';
import { listFiles } from '../../../logic/s3/s3Utils';

const getProcessFileListDirectory = (
  runtimeConfig: QPQAWSLambdaConfig,
): FileListDirectoryActionProcessor => {
  return async ({ drive, folderPath, maxFiles, pageToken }) => {
    const s3BucketName = resolveResourceName(drive, runtimeConfig);
    const s3FileList = await listFiles(s3BucketName, folderPath, maxFiles, pageToken);

    // Add the drive onto the list
    const fileInfos = s3FileList.fileInfos.map((s3fi) => ({
      ...s3fi,
      drive: drive,
    }));

    return actionResult({
      fileInfos,
      pageToken: s3FileList.pageToken,
    });
  };
};

export default (runtimeConfig: QPQAWSLambdaConfig) => ({
  [FileActionType.ListDirectory]: getProcessFileListDirectory(runtimeConfig),
});
