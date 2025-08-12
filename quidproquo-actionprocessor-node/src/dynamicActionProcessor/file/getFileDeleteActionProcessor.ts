import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  ErrorTypeEnum,
  FileActionType,
  FileDeleteActionProcessor,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';

import * as fs from 'fs/promises';

import { FileStorageConfig } from './types';
import { resolveFilePath } from './utils';

const getProcessFileDelete = (
  qpqConfig: QPQConfig,
  config: FileStorageConfig
): FileDeleteActionProcessor => {
    const serviceName = qpqCoreUtils.getApplicationModuleName(qpqConfig);

  return async ({ drive, filepaths }) => {
    const deletedFiles: string[] = [];
    const errors: string[] = [];
    
    for (const filepath of filepaths) {
      try {
        const fullPath = resolveFilePath(config, serviceName, drive, filepath);
        
        await fs.unlink(fullPath);
        deletedFiles.push(filepath);
      } catch (error: any) {
        // If file doesn't exist, consider it successfully deleted
        if (error.code === 'ENOENT') {
          deletedFiles.push(filepath);
        } else {
          errors.push(`Failed to delete ${filepath}: ${error.message}`);
        }
      }
    }
    
    if (errors.length > 0 && deletedFiles.length === 0) {
      return actionResultError(ErrorTypeEnum.GenericError, `Failed to delete files: ${errors.join(', ')}`);
    }
    
    return actionResult(deletedFiles);
  };
};

export const getFileDeleteActionProcessor = (
  config: FileStorageConfig
): ActionProcessorListResolver => async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [FileActionType.Delete]: getProcessFileDelete(qpqConfig, config),
});