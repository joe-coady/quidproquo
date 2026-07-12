import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  composeScopedFilePath,
  FileActionType,
  FileListDirectoryActionProcessor,
  FileListDirectoryErrorTypeEnum,
  QPQConfig,
  stripScopedFilePath,
} from 'quidproquo-core';

import { listFiles } from '../../../logic/s3/s3Utils';
import { resolveStorageDriveBucketName } from './utils';

const getProcessFileListDirectory = (qpqConfig: QPQConfig): FileListDirectoryActionProcessor => {
  return async ({ drive, folderPath, maxFiles, pageToken, scope }) => {
    const s3BucketName = resolveStorageDriveBucketName(drive, qpqConfig);

    try {
      const s3FileList = await listFiles(
        s3BucketName,
        qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig),
        composeScopedFilePath(scope, folderPath),
        maxFiles,
        pageToken,
      );

      // S3 keys carry the scope prefix; strip it so callers see the same
      // scope-relative paths they passed in. Add the drive onto the list.
      const fileInfos = s3FileList.fileInfos.map((s3fi) => ({
        ...s3fi,
        filepath: stripScopedFilePath(scope, s3fi.filepath),
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
        InvalidScopeError: (error) => actionResultError(FileListDirectoryErrorTypeEnum.InvalidScope, error.message),
      });
    }
  };
};

export const getFileListDirectoryActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [FileActionType.ListDirectory]: getProcessFileListDirectory(qpqConfig),
});
