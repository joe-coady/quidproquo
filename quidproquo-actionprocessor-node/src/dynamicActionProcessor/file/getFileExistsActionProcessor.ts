import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  ErrorTypeEnum,
  FileActionType,
  FileExistsActionProcessor,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';
import * as fs from 'fs/promises';
import { resolveFilePath } from './utils';
import { FileStorageConfig } from './types';

const getProcessFileExists = (
  qpqConfig: QPQConfig,
  config: FileStorageConfig
): FileExistsActionProcessor => {
  const serviceName = qpqCoreUtils.getApplicationModuleName(qpqConfig);

  return async ({ drive, filepath }) => {
    try {
      const fullPath = resolveFilePath(config, serviceName, drive, filepath);

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