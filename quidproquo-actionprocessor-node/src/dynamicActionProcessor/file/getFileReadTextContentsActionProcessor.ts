import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  FileActionType,
  FileReadTextContentsActionProcessor,
  FileReadTextContentsErrorTypeEnum,
  QPQConfig,
} from 'quidproquo-core';

import * as fs from 'fs/promises';

import { FileStorageConfig } from './types';
import { resolveFilePath } from './utils';

const getProcessFileReadTextContents = (qpqConfig: QPQConfig, config: FileStorageConfig): FileReadTextContentsActionProcessor => {
  return async ({ drive, filepath, scope }) => {
    try {
      const fullPath = resolveFilePath(config, qpqConfig, drive, filepath, scope);
      const content = await fs.readFile(fullPath, 'utf8');
      return actionResult(content);
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        InvalidScopeError: (error) => actionResultError(FileReadTextContentsErrorTypeEnum.InvalidScope, error.message),
        ENOENT: () => actionResultError(FileReadTextContentsErrorTypeEnum.FileNotFound, `File not found: ${filepath}`), // node fs code
      });
    }
  };
};

export const getFileReadTextContentsActionProcessor =
  (config: FileStorageConfig): ActionProcessorListResolver =>
  async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
    [FileActionType.ReadTextContents]: getProcessFileReadTextContents(qpqConfig, config),
  });
