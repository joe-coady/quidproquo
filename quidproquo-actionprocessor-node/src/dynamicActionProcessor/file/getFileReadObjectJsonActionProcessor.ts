import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  ErrorTypeEnum,
  FileActionType,
  FileReadObjectJsonActionProcessor,
  FileReadObjectJsonErrorTypeEnum,
  QPQConfig,
} from 'quidproquo-core';

import * as fs from 'fs/promises';

import { FileStorageConfig } from './types';
import { resolveFilePath } from './utils';

const getProcessFileReadObjectJson =
  (config: FileStorageConfig) =>
  (qpqConfig: QPQConfig): FileReadObjectJsonActionProcessor<any> => {
    return async ({ drive, filepath, scope }) => {
      try {
        const fullPath = resolveFilePath(config, qpqConfig, drive, filepath, scope);
        const content = await fs.readFile(fullPath, 'utf8');
        const jsonObject = JSON.parse(content);
        return actionResult(jsonObject);
      } catch (error: unknown) {
        return actionResultErrorFromCaughtError(error, {
          InvalidScopeError: (error) => actionResultError(FileReadObjectJsonErrorTypeEnum.InvalidScope, error.message),
          ENOENT: () => actionResultError(ErrorTypeEnum.NotFound, `File not found: ${filepath}`), // node fs code
          SyntaxError: () => actionResultError(ErrorTypeEnum.GenericError, `Invalid JSON in file: ${filepath}`), // JSON.parse failure
        });
      }
    };
  };

export const getFileReadObjectJsonActionProcessor =
  (config: FileStorageConfig): ActionProcessorListResolver =>
  async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
    [FileActionType.ReadObjectJson]: getProcessFileReadObjectJson(config)(qpqConfig),
  });
