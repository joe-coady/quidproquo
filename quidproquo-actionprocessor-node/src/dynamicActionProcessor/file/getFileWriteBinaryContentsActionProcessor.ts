import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  ErrorTypeEnum,
  FileActionType,
  FileWriteBinaryContentsActionProcessor,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';
import * as fs from 'fs/promises';
import { resolveFilePath, ensureParentDirectoryExists } from './utils';
import { FileStorageConfig } from './types';

const getProcessFileWriteBinaryContents = (config: FileStorageConfig) => (qpqConfig: QPQConfig): FileWriteBinaryContentsActionProcessor => {
  const serviceName = qpqCoreUtils.getApplicationModuleName(qpqConfig);

  return async ({ drive, filepath, data }) => {
    try {
      const fullPath = resolveFilePath(config, serviceName, drive, filepath);
      await ensureParentDirectoryExists(fullPath);
      
      // Convert QPQBinaryData to Buffer
      const buffer = Buffer.from(data.base64Data, 'base64');
      await fs.writeFile(fullPath, buffer);
      
      return actionResult(void 0);
    } catch (error: any) {
      return actionResultError(ErrorTypeEnum.GenericError, `Error writing binary file: ${error.message}`);
    }
  };
};

export const getFileWriteBinaryContentsActionProcessor = (config: FileStorageConfig): ActionProcessorListResolver => async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [FileActionType.WriteBinaryContents]: getProcessFileWriteBinaryContents(config)(qpqConfig),
});