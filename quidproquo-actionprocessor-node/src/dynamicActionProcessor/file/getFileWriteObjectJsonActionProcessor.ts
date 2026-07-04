import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  FileActionType,
  FileWriteObjectJsonActionProcessor,
  FileWriteObjectJsonErrorTypeEnum,
  QPQConfig,
} from 'quidproquo-core';

import * as fs from 'fs/promises';

import { FileStorageConfig } from './types';
import { ensureParentDirectoryExists, resolveFilePath } from './utils';

const getProcessFileWriteObjectJson =
  (config: FileStorageConfig) =>
  (qpqConfig: QPQConfig): FileWriteObjectJsonActionProcessor<any> => {
    return async ({ drive, filepath, data }) => {
      try {
        const fullPath = resolveFilePath(config, qpqConfig, drive, filepath);
        await ensureParentDirectoryExists(fullPath);
        const jsonString = JSON.stringify(data, null, 2);
        await fs.writeFile(fullPath, jsonString, 'utf8');
        return actionResult(void 0);
      } catch (error: unknown) {
        return actionResultErrorFromCaughtError(error, {
          EACCES: () => actionResultError(FileWriteObjectJsonErrorTypeEnum.AccessDenied, `Access denied writing file: ${filepath}`), // node fs code
        });
      }
    };
  };

export const getFileWriteObjectJsonActionProcessor =
  (config: FileStorageConfig): ActionProcessorListResolver =>
  async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
    [FileActionType.WriteObjectJson]: getProcessFileWriteObjectJson(config)(qpqConfig),
  });
