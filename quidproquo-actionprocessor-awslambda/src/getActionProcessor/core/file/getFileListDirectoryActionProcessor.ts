import {
  FileListDirectoryActionProcessor,
  actionResult,
  FileActionType,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';

import { resolveStorageDriveBucketName } from './utils';
import { listFiles } from '../../../logic/s3/s3Utils';

const getProcessFileListDirectory = (qpqConfig: QPQConfig): FileListDirectoryActionProcessor => {
  return async ({ drive, folderPath, maxFiles, pageToken }) => {
    const s3BucketName = resolveStorageDriveBucketName(drive, qpqConfig);
    const s3FileList = await listFiles(
      s3BucketName,
      qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig),
      folderPath,
      maxFiles,
      pageToken,
    );

    // Add the drive onto the list
    const fileInfos = s3FileList.fileInfos.map((s3fi) => ({
      ...s3fi,
      drive,
    }));

    return actionResult({
      fileInfos,
      pageToken: s3FileList.pageToken,
    });
  };
};

export default (qpqConfig: QPQConfig) => ({
  [FileActionType.ListDirectory]: getProcessFileListDirectory(qpqConfig),
});
