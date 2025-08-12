import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  ErrorTypeEnum,
  FileActionType,
  FileReadBinaryContentsActionProcessor,
  QPQBinaryData,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';

import * as fs from 'fs/promises';
import * as path from 'path';

import { FileStorageConfig } from './types';
import { resolveFilePath } from './utils';

const getProcessFileReadBinaryContents = (config: FileStorageConfig) => (qpqConfig: QPQConfig): FileReadBinaryContentsActionProcessor => {
  const serviceName = qpqCoreUtils.getApplicationModuleName(qpqConfig);

  return async ({ drive, filepath }) => {
    try {
      const fullPath = resolveFilePath(config, serviceName, drive, filepath);
      const buffer = await fs.readFile(fullPath);
      
      // Convert Buffer to QPQBinaryData
      const binaryData: QPQBinaryData = {
        base64Data: buffer.toString('base64'),
        filename: path.basename(filepath),
        mimetype: 'application/octet-stream', // Default mimetype for binary files
      };
      
      return actionResult(binaryData);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return actionResultError(ErrorTypeEnum.NotFound, `File not found: ${filepath}`);
      }
      return actionResultError(ErrorTypeEnum.GenericError, `Error reading binary file: ${error.message}`);
    }
  };
};

export const getFileReadBinaryContentsActionProcessor = (config: FileStorageConfig): ActionProcessorListResolver => async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [FileActionType.ReadBinaryContents]: getProcessFileReadBinaryContents(config)(qpqConfig),
});