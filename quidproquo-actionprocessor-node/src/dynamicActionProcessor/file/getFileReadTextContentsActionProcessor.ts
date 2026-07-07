import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  ErrorTypeEnum,
  FileActionType,
  FileReadTextContentsActionProcessor,
  QPQConfig,
} from 'quidproquo-core';

import * as fs from 'fs/promises';

import { FileStorageConfig } from './types';
import { resolveFilePath } from './utils';

const getProcessFileReadTextContents = (qpqConfig: QPQConfig, config: FileStorageConfig): FileReadTextContentsActionProcessor => {
  return async ({ drive, filepath }) => {
    try {
      const fullPath = resolveFilePath(config, qpqConfig, drive, filepath);
      const content = await fs.readFile(fullPath, 'utf8');
      return actionResult(content);
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        ENOENT: () => actionResultError(ErrorTypeEnum.NotFound, `File not found: ${filepath}`), // node fs code
      });
    }
  };
};

export const getFileReadTextContentsActionProcessor =
  (config: FileStorageConfig): ActionProcessorListResolver =>
  async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
    [FileActionType.ReadTextContents]: getProcessFileReadTextContents(qpqConfig, config),
  });
