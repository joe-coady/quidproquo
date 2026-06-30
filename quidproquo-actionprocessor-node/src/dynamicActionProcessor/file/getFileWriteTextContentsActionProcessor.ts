import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  ErrorTypeEnum,
  FileActionType,
  FileWriteTextContentsActionProcessor,
  FileWriteTextContentsErrorTypeEnum,
  QPQConfig,
} from 'quidproquo-core';

import * as fs from 'fs/promises';

import { FileStorageConfig } from './types';
import { ensureParentDirectoryExists,resolveFilePath } from './utils';

const getProcessFileWriteTextContents = (
  qpqConfig: QPQConfig,
  config: FileStorageConfig
): FileWriteTextContentsActionProcessor => {
  return async ({ drive, filepath, data }) => {
    try {
      const fullPath = resolveFilePath(config, qpqConfig, drive, filepath);
      await ensureParentDirectoryExists(fullPath);
      await fs.writeFile(fullPath, data, 'utf8');
      return actionResult(void 0);
    } catch (error: any) {
      if (error.code === 'EACCES') {
        return actionResultError(FileWriteTextContentsErrorTypeEnum.AccessDenied, `Access denied writing file: ${filepath}`);
      }
      return actionResultError(ErrorTypeEnum.GenericError, `Error writing file: ${error.message}`);
    }
  };
};

export const getFileWriteTextContentsActionProcessor = (
  config: FileStorageConfig
): ActionProcessorListResolver => async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [FileActionType.WriteTextContents]: getProcessFileWriteTextContents(qpqConfig, config),
});