import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
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
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        EACCES: () => actionResultError(FileWriteTextContentsErrorTypeEnum.AccessDenied, `Access denied writing file: ${filepath}`), // node fs code
      });
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