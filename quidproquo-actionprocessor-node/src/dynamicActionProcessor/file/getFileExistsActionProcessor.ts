import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  ErrorTypeEnum,
  FileActionType,
  FileExistsActionProcessor,
  QPQConfig,
} from 'quidproquo-core';

import * as fs from 'fs/promises';

import { FileStorageConfig } from './types';
import { resolveFilePath } from './utils';

const getProcessFileExists = (
  qpqConfig: QPQConfig,
  config: FileStorageConfig
): FileExistsActionProcessor => {
  return async ({ drive, filepath }) => {
    try {
      const fullPath = resolveFilePath(config, qpqConfig, drive, filepath);

      try {
        await fs.access(fullPath);
        return actionResult(true);
      } catch {
        return actionResult(false);
      }
    } catch (error: any) {
      return actionResultError(ErrorTypeEnum.GenericError, `Error checking file existence: ${error.message}`);
    }
  };
};

export const getFileExistsActionProcessor = (
  config: FileStorageConfig
): ActionProcessorListResolver => async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [FileActionType.Exists]: getProcessFileExists(qpqConfig, config),
});