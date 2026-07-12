import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  FileActionType,
  FileGenerateTemporaryUploadSecureUrlActionProcessor,
  FileGenerateTemporaryUploadSecureUrlErrorTypeEnum,
  QPQConfig,
} from 'quidproquo-core';

import { createSecureUrlToken, getSecureUrlBaseUrl } from './secureUrlUtils';
import { FileStorageConfig } from './types';
import { resolveFilePath } from './utils';

// Mirror the AWS processor's SigV4 limit (7 days) so a story that would fail
// in production fails the same way on the dev server.
const maxExpirationMs = 7 * 24 * 60 * 60 * 1000;

const getProcessFileGenerateTemporaryUploadSecureUrl = (
  qpqConfig: QPQConfig,
  config: FileStorageConfig,
): FileGenerateTemporaryUploadSecureUrlActionProcessor => {
  return async ({ drive, filepath, expirationMs, contentType, scope }) => {
    if (expirationMs > maxExpirationMs) {
      return actionResultError(
        FileGenerateTemporaryUploadSecureUrlErrorTypeEnum.ExpirationTooLong,
        'Expiration exceeds the 7 day maximum for presigned URLs',
      );
    }

    try {
      const expiresAt = Date.now() + expirationMs;

      // Create a token for upload
      const token = createSecureUrlToken(
        {
          fullFilepath: resolveFilePath(config, qpqConfig, drive, filepath, scope),
          operation: 'upload',
          expiresAt,
          contentType,
        },
        config.secureUrlSecret,
      );

      // Build the secure URL
      const baseUrl = getSecureUrlBaseUrl(config);
      const url = `${baseUrl}/secure-upload?token=${token}`;

      console.log(`Generated upload URL for ${filepath} in drive ${drive}, expires at ${new Date(expiresAt).toISOString()}`);

      return actionResult(url);
    } catch (error: unknown) {
      // Name-keyed, not instanceof: under npm link / module federation the
      // error can come from another copy of quidproquo-core.
      return actionResultErrorFromCaughtError(error, {
        InvalidScopeError: (error) => actionResultError(FileGenerateTemporaryUploadSecureUrlErrorTypeEnum.InvalidScope, error.message),
      });
    }
  };
};

export const getFileGenerateTemporaryUploadSecureUrlActionProcessor =
  (config: FileStorageConfig): ActionProcessorListResolver =>
  async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
    [FileActionType.GenerateTemporaryUploadSecureUrl]: getProcessFileGenerateTemporaryUploadSecureUrl(qpqConfig, config),
  });
