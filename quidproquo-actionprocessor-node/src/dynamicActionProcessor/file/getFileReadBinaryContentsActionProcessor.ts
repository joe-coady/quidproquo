import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  FileActionType,
  FileReadBinaryContentsActionProcessor,
  FileReadBinaryContentsErrorTypeEnum,
  QPQBinaryData,
  QPQConfig,
} from 'quidproquo-core';

import * as fs from 'fs/promises';
import * as path from 'path';

import { FileStorageConfig } from './types';
import { resolveFilePath } from './utils';

const getProcessFileReadBinaryContents =
  (config: FileStorageConfig) =>
  (qpqConfig: QPQConfig): FileReadBinaryContentsActionProcessor => {
    return async ({ drive, filepath, scope }) => {
      try {
        const fullPath = resolveFilePath(config, qpqConfig, drive, filepath, scope);
        const buffer = await fs.readFile(fullPath);

        // Convert Buffer to QPQBinaryData
        const binaryData: QPQBinaryData = {
          base64Data: buffer.toString('base64'),
          filename: path.basename(filepath),
          mimetype: 'application/octet-stream', // Default mimetype for binary files
        };

        return actionResult(binaryData);
      } catch (error: unknown) {
        return actionResultErrorFromCaughtError(error, {
          InvalidScopeError: (error) => actionResultError(FileReadBinaryContentsErrorTypeEnum.InvalidScope, error.message),
          ENOENT: () => actionResultError(FileReadBinaryContentsErrorTypeEnum.FileNotFound, `File not found: ${filepath}`), // node fs code
        });
      }
    };
  };

export const getFileReadBinaryContentsActionProcessor =
  (config: FileStorageConfig): ActionProcessorListResolver =>
  async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
    [FileActionType.ReadBinaryContents]: getProcessFileReadBinaryContents(config)(qpqConfig),
  });
