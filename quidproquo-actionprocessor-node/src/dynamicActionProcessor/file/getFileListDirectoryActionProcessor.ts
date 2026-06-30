import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  DirectoryList,
  FileActionType,
  FileInfo,
  FileListDirectoryActionProcessor,
  FileListDirectoryErrorTypeEnum,
  QPQConfig,
} from 'quidproquo-core';

import * as fs from 'fs/promises';
import * as path from 'path';

import { FileStorageConfig } from './types';
import { resolveFilePath } from './utils';

const getProcessFileListDirectory = (config: FileStorageConfig) => (qpqConfig: QPQConfig): FileListDirectoryActionProcessor => {
  return async ({ drive, folderPath, maxFiles, pageToken }) => {
    try {
      const fullPath = resolveFilePath(config, qpqConfig, drive, folderPath || '');

      // Read all entries in the directory
      const entries = await fs.readdir(fullPath, { withFileTypes: true });
      
      // Build file info list
      const allFiles: FileInfo[] = [];
      for (const entry of entries) {        
        allFiles.push({
          filepath: path.join(folderPath || '', entry.name),
          drive: drive,
          isDir: entry.isDirectory(),
          hashMd5: undefined,
        });
      }
      
      // Sort by filepath for consistent pagination
      allFiles.sort((a, b) => a.filepath.localeCompare(b.filepath));
      
      // Handle pagination
      const startIndex = pageToken ? parseInt(pageToken, 10) : 0;
      const endIndex = Math.min(startIndex + maxFiles, allFiles.length);
      const paginatedFiles = allFiles.slice(startIndex, endIndex);
      
      const result: DirectoryList = {
        fileInfos: paginatedFiles,
      };
      
      // Add page token if there are more files
      if (endIndex < allFiles.length) {
        result.pageToken = endIndex.toString();
      }
      
      return actionResult(result);
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        ENOENT: () => actionResultError(FileListDirectoryErrorTypeEnum.DirectoryNotFound, `Directory not found: ${folderPath}`), // node fs code
        ENOTDIR: () => actionResultError(FileListDirectoryErrorTypeEnum.NotADirectory, `Path is not a directory: ${folderPath}`), // node fs code
        EACCES: () => actionResultError(FileListDirectoryErrorTypeEnum.AccessDenied, `Access denied listing directory: ${folderPath}`), // node fs code
      });
    }
  };
};

export const getFileListDirectoryActionProcessor = (config: FileStorageConfig): ActionProcessorListResolver => async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [FileActionType.ListDirectory]: getProcessFileListDirectory(config)(qpqConfig),
});