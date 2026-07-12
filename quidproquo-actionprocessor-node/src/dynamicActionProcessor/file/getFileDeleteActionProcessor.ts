import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  ErrorTypeEnum,
  FileActionType,
  FileDeleteActionProcessor,
  FileDeleteErrorTypeEnum,
  QPQConfig,
} from 'quidproquo-core';

import * as fs from 'fs/promises';

import { FileStorageConfig } from './types';
import { resolveFilePath } from './utils';

const getProcessFileDelete = (qpqConfig: QPQConfig, config: FileStorageConfig): FileDeleteActionProcessor => {
  return async ({ drive, filepaths, scope }) => {
    const deletedFiles: string[] = [];
    const errors: { filepath: string; error: any }[] = [];

    for (const filepath of filepaths) {
      try {
        const fullPath = resolveFilePath(config, qpqConfig, drive, filepath, scope);

        await fs.unlink(fullPath);
        deletedFiles.push(filepath);
      } catch (error: any) {
        // If file doesn't exist, consider it successfully deleted
        if (error.code === 'ENOENT') {
          deletedFiles.push(filepath);
        } else {
          errors.push({ filepath, error });
        }
      }
    }

    // Scope is shared by every filepath in the request, so a bad scope fails the
    // whole call regardless of any deletes that a different code path allowed.
    // Name-keyed, not instanceof: under npm link / module federation the error
    // can come from another copy of quidproquo-core.
    const invalidScope = errors.find(({ error }) => error?.name === 'InvalidScopeError');
    if (invalidScope) {
      return actionResultError(FileDeleteErrorTypeEnum.InvalidScope, invalidScope.error.message);
    }

    if (errors.length > 0 && deletedFiles.length === 0) {
      // EACCES maps to the same typed error the S3 processor returns for AccessDenied
      if (errors.some(({ error }) => error.code === 'EACCES')) {
        return actionResultError(FileDeleteErrorTypeEnum.AccessDenied, 'Access denied deleting files');
      }
      return actionResultError(
        ErrorTypeEnum.GenericError,
        `Failed to delete files: ${errors.map(({ filepath, error }) => `Failed to delete ${filepath}: ${error.message}`).join(', ')}`,
      );
    }

    return actionResult(deletedFiles);
  };
};

export const getFileDeleteActionProcessor =
  (config: FileStorageConfig): ActionProcessorListResolver =>
  async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
    [FileActionType.Delete]: getProcessFileDelete(qpqConfig, config),
  });
