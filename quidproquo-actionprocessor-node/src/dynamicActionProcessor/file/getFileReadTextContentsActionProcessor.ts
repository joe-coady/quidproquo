import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  ErrorTypeEnum,
  FileActionType,
  FileReadTextContentsActionProcessor,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';
import * as fs from 'fs/promises';
import { resolveFilePath } from './utils';
import { FileStorageConfig } from './types';

const getProcessFileReadTextContents = (
  qpqConfig: QPQConfig,
  config: FileStorageConfig
): FileReadTextContentsActionProcessor => {
  const serviceName = qpqCoreUtils.getApplicationModuleName(qpqConfig);

  return async ({ drive, filepath }) => {
    try {
      const fullPath = resolveFilePath(config, serviceName, drive, filepath);
      const content = await fs.readFile(fullPath, 'utf8');
      return actionResult(content);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return actionResultError(ErrorTypeEnum.NotFound, `File not found: ${filepath}`);
      }
      return actionResultError(ErrorTypeEnum.GenericError, `Error reading file: ${error.message}`);
    }
  };
};

export const getFileReadTextContentsActionProcessor = (
  config: FileStorageConfig
): ActionProcessorListResolver => async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [FileActionType.ReadTextContents]: getProcessFileReadTextContents(qpqConfig, config),
});