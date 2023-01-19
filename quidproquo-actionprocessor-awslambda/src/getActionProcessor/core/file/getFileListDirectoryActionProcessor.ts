import {
  FileListDirectoryActionProcessor,
  actionResult,
  FileActionType,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';

import { QPQAWSResourceMap } from '../../../runtimeConfig/QPQAWSResourceMap';
import { resolveResourceName } from '../../../runtimeConfig/qpqAwsLambdaRuntimeConfigUtils';
import { listFiles } from '../../../logic/s3/s3Utils';

const getProcessFileListDirectory = (
  qpqConfig: QPQConfig,
  awsResourceMap: QPQAWSResourceMap,
): FileListDirectoryActionProcessor => {
  return async ({ drive, folderPath, maxFiles, pageToken }) => {
    const s3BucketName = resolveResourceName(drive, awsResourceMap);
    const s3FileList = await listFiles(
      s3BucketName,
      qpqCoreUtils.getDeployRegion(qpqConfig),
      folderPath,
      maxFiles,
      pageToken,
    );

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

export default (qpqConfig: QPQConfig, awsResourceMap: QPQAWSResourceMap) => ({
  [FileActionType.ListDirectory]: getProcessFileListDirectory(qpqConfig, awsResourceMap),
});
