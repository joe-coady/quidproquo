import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  ErrorTypeEnum,
  FileActionType,
  FileExistsActionProcessor,
  FileExistsErrorTypeEnum,
  InvalidScopeError,
  QPQConfig,
} from 'quidproquo-core';

import * as fs from 'fs/promises';

import { FileStorageConfig } from './types';
import { resolveFilePath } from './utils';

const getProcessFileExists = (qpqConfig: QPQConfig, config: FileStorageConfig): FileExistsActionProcessor => {
  return async ({ drive, filepath, scope }) => {
    try {
      const fullPath = resolveFilePath(config, qpqConfig, drive, filepath, scope);

      try {
        await fs.access(fullPath);
        return actionResult(true);
      } catch (error: any) {
        // Missing file is a definitive false; permission problems must surface.
        if (error.code === 'ENOENT') {
          return actionResult(false);
        }
        if (error.code === 'EACCES') {
          return actionResultError(FileExistsErrorTypeEnum.AccessDenied, `Access denied checking file existence: ${filepath}`);
        }
        throw error;
      }
    } catch (error: any) {
      if (error instanceof InvalidScopeError) {
        return actionResultError(FileExistsErrorTypeEnum.InvalidScope, error.message);
      }
      return actionResultError(ErrorTypeEnum.GenericError, `Error checking file existence: ${error.message}`);
    }
  };
};

export const getFileExistsActionProcessor =
  (config: FileStorageConfig): ActionProcessorListResolver =>
  async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
    [FileActionType.Exists]: getProcessFileExists(qpqConfig, config),
  });
