import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  ErrorTypeEnum,
  FileActionType,
  FileWriteObjectJsonActionProcessor,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';

import * as fs from 'fs/promises';

import { FileStorageConfig } from './types';
import { ensureParentDirectoryExists,resolveFilePath } from './utils';

const getProcessFileWriteObjectJson = (config: FileStorageConfig) => (qpqConfig: QPQConfig): FileWriteObjectJsonActionProcessor<any> => {
  const serviceName = qpqCoreUtils.getApplicationModuleName(qpqConfig);
  
  return async ({ drive, filepath, data }) => {
    try {
      const fullPath = resolveFilePath(config, serviceName, drive, filepath);
      await ensureParentDirectoryExists(fullPath);
      const jsonString = JSON.stringify(data, null, 2);
      await fs.writeFile(fullPath, jsonString, 'utf8');
      return actionResult(void 0);
    } catch (error: any) {
      return actionResultError(ErrorTypeEnum.GenericError, `Error writing JSON file: ${error.message}`);
    }
  };
};

export const getFileWriteObjectJsonActionProcessor = (config: FileStorageConfig): ActionProcessorListResolver => async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [FileActionType.WriteObjectJson]: getProcessFileWriteObjectJson(config)(qpqConfig),
});