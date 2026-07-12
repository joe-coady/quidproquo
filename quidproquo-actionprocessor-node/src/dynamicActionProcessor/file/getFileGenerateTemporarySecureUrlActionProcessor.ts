import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  ErrorTypeEnum,
  FileActionType,
  FileGenerateTemporarySecureUrlActionProcessor,
  FileGenerateTemporarySecureUrlErrorTypeEnum,
  InvalidScopeError,
  QPQConfig,
} from 'quidproquo-core';

import { createSecureUrlToken, getSecureUrlBaseUrl } from './secureUrlUtils';
import { FileStorageConfig } from './types';
import { resolveFilePath } from './utils';

const getProcessFileGenerateTemporarySecureUrl = (qpqConfig: QPQConfig, config: FileStorageConfig): FileGenerateTemporarySecureUrlActionProcessor => {
  return async ({ drive, filepath, expirationMs, scope }) => {
    try {
      // Create a token for download
      const token = createSecureUrlToken(
        {
          fullFilepath: resolveFilePath(config, qpqConfig, drive, filepath, scope),
          operation: 'download',
          expiresAt: Date.now() + expirationMs,
        },
        config.secureUrlSecret,
      );

      // Build the secure URL
      const baseUrl = getSecureUrlBaseUrl(config);
      const url = `${baseUrl}/secure-download?token=${token}`;

      return actionResult(url);
    } catch (error: any) {
      if (error instanceof InvalidScopeError) {
        return actionResultError(FileGenerateTemporarySecureUrlErrorTypeEnum.InvalidScope, error.message);
      }
      return actionResultError(ErrorTypeEnum.GenericError, `Unable to generate temporary secure URL: ${error.message}`);
    }
  };
};

export const getFileGenerateTemporarySecureUrlActionProcessor =
  (config: FileStorageConfig): ActionProcessorListResolver =>
  async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
    [FileActionType.GenerateTemporarySecureUrl]: getProcessFileGenerateTemporarySecureUrl(qpqConfig, config),
  });
