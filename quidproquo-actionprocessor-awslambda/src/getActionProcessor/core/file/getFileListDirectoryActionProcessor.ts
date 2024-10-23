import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  FileActionType,
  FileListDirectoryActionProcessor,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';

import { listFiles } from '../../../logic/s3/s3Utils';
import { resolveStorageDriveBucketName } from './utils';

const getProcessFileListDirectory = (qpqConfig: QPQConfig): FileListDirectoryActionProcessor => {
  return async ({ drive, folderPath, maxFiles, pageToken }) => {
    const s3BucketName = resolveStorageDriveBucketName(drive, qpqConfig);
    const s3FileList = await listFiles(s3BucketName, qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig), folderPath, maxFiles, pageToken);

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

export const getFileListDirectoryActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [FileActionType.ListDirectory]: getProcessFileListDirectory(qpqConfig),
});
