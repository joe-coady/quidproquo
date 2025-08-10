import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  DirectoryList,
  ErrorTypeEnum,
  FileActionType,
  FileInfo,
  FileListDirectoryActionProcessor,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';
import * as fs from 'fs/promises';
import * as path from 'path';
import { resolveFilePath } from './utils';
import { FileStorageConfig } from './types';

const getProcessFileListDirectory = (config: FileStorageConfig) => (qpqConfig: QPQConfig): FileListDirectoryActionProcessor => {
  const serviceName = qpqCoreUtils.getApplicationModuleName(qpqConfig);

  return async ({ drive, folderPath, maxFiles, pageToken }) => {
    try {
      const fullPath = resolveFilePath(config, serviceName, drive, folderPath || '');

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
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return actionResultError(ErrorTypeEnum.NotFound, `Directory not found: ${folderPath}`);
      }
      if (error.code === 'ENOTDIR') {
        return actionResultError(ErrorTypeEnum.GenericError, `Path is not a directory: ${folderPath}`);
      }
      return actionResultError(ErrorTypeEnum.GenericError, `Error listing directory: ${error.message}`);
    }
  };
};

export const getFileListDirectoryActionProcessor = (config: FileStorageConfig): ActionProcessorListResolver => async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [FileActionType.ListDirectory]: getProcessFileListDirectory(config)(qpqConfig),
});