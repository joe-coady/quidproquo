import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  ErrorTypeEnum,
  FileActionType,
  FileWriteTextContentsActionProcessor,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';

import * as fs from 'fs/promises';

import { FileStorageConfig } from './types';
import { ensureParentDirectoryExists,resolveFilePath } from './utils';

const getProcessFileWriteTextContents = (
  qpqConfig: QPQConfig,
  config: FileStorageConfig
): FileWriteTextContentsActionProcessor => {
  const serviceName = qpqCoreUtils.getApplicationModuleName(qpqConfig);

  return async ({ drive, filepath, data }) => {
    try {
      const fullPath = resolveFilePath(config, serviceName, drive, filepath);
      await ensureParentDirectoryExists(fullPath);
      await fs.writeFile(fullPath, data, 'utf8');
      return actionResult(void 0);
    } catch (error: any) {
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