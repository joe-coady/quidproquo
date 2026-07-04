import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  FileActionType,
  FileListDirectoryActionProcessor,
  FileListDirectoryErrorTypeEnum,
  QPQConfig,
} from 'quidproquo-core';

import { listFiles } from '../../../logic/s3/s3Utils';
import { resolveStorageDriveBucketName } from './utils';

const getProcessFileListDirectory = (qpqConfig: QPQConfig): FileListDirectoryActionProcessor => {
  return async ({ drive, folderPath, maxFiles, pageToken }) => {
    const s3BucketName = resolveStorageDriveBucketName(drive, qpqConfig);

    try {
      const s3FileList = await listFiles(
        s3BucketName,
        qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig),
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
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        AccessDenied: () => actionResultError(FileListDirectoryErrorTypeEnum.AccessDenied, 'Access denied listing directory'),
        Forbidden: () => actionResultError(FileListDirectoryErrorTypeEnum.AccessDenied, 'Access denied listing directory'),
        NoSuchBucket: () => actionResultError(FileListDirectoryErrorTypeEnum.DriveNotFound, `Storage drive not found: ${drive}`),
      });
    }
  };
};

export const getFileListDirectoryActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [FileActionType.ListDirectory]: getProcessFileListDirectory(qpqConfig),
});
