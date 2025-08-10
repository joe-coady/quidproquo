import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  ErrorTypeEnum,
  FileActionType,
  FileReadObjectJsonActionProcessor,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';
import * as fs from 'fs/promises';
import { resolveFilePath } from './utils';
import { FileStorageConfig } from './types';

const getProcessFileReadObjectJson = (config: FileStorageConfig) => (qpqConfig: QPQConfig): FileReadObjectJsonActionProcessor<any> => {
  const serviceName = qpqCoreUtils.getApplicationModuleName(qpqConfig);

  return async ({ drive, filepath }) => {
    try {
      const fullPath = resolveFilePath(config, serviceName, drive, filepath);
      const content = await fs.readFile(fullPath, 'utf8');
      const jsonObject = JSON.parse(content);
      return actionResult(jsonObject);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return actionResultError(ErrorTypeEnum.NotFound, `File not found: ${filepath}`);
      }
      if (error instanceof SyntaxError) {
        return actionResultError(ErrorTypeEnum.GenericError, `Invalid JSON in file: ${filepath}`);
      }
      return actionResultError(ErrorTypeEnum.GenericError, `Error reading JSON file: ${error.message}`);
    }
  };
};

export const getFileReadObjectJsonActionProcessor = (config: FileStorageConfig): ActionProcessorListResolver => async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [FileActionType.ReadObjectJson]: getProcessFileReadObjectJson(config)(qpqConfig),
});