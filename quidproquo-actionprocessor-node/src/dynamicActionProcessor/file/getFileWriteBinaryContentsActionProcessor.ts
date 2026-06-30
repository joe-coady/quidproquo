import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  ErrorTypeEnum,
  FileActionType,
  FileWriteBinaryContentsActionProcessor,
  FileWriteBinaryContentsErrorTypeEnum,
  QPQConfig,
} from 'quidproquo-core';

import * as fs from 'fs/promises';

import { FileStorageConfig } from './types';
import { ensureParentDirectoryExists,resolveFilePath } from './utils';

const getProcessFileWriteBinaryContents = (config: FileStorageConfig) => (qpqConfig: QPQConfig): FileWriteBinaryContentsActionProcessor => {
  return async ({ drive, filepath, data }) => {
    try {
      const fullPath = resolveFilePath(config, qpqConfig, drive, filepath);
      await ensureParentDirectoryExists(fullPath);
      
      // Convert QPQBinaryData to Buffer
      const buffer = Buffer.from(data.base64Data, 'base64');
      await fs.writeFile(fullPath, buffer);

      if (data.mimetype || data.contentDisposition) {
        await fs.writeFile(
          `${fullPath}.qpqmeta.json`,
          JSON.stringify({
            mimetype: data.mimetype,
            contentDisposition: data.contentDisposition,
          })
        );
      }

      return actionResult(void 0);
    } catch (error: any) {
      if (error.code === 'EACCES') {
        return actionResultError(FileWriteBinaryContentsErrorTypeEnum.AccessDenied, `Access denied writing file: ${filepath}`);
      }
      return actionResultError(ErrorTypeEnum.GenericError, `Error writing binary file: ${error.message}`);
    }
  };
};

export const getFileWriteBinaryContentsActionProcessor = (config: FileStorageConfig): ActionProcessorListResolver => async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [FileActionType.WriteBinaryContents]: getProcessFileWriteBinaryContents(config)(qpqConfig),
});