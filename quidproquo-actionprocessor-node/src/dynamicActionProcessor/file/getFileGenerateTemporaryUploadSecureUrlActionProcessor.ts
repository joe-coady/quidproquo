import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  ErrorTypeEnum,
  FileActionType,
  FileGenerateTemporaryUploadSecureUrlActionProcessor,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';
import { createSecureUrlToken, getSecureUrlBaseUrl } from './secureUrlUtils';
import { FileStorageConfig } from './types';
import { resolveFilePath } from './utils';

const getProcessFileGenerateTemporaryUploadSecureUrl = (
  qpqConfig: QPQConfig,
  config: FileStorageConfig
): FileGenerateTemporaryUploadSecureUrlActionProcessor => {
  const serviceName = qpqCoreUtils.getApplicationModuleName(qpqConfig);

  return async ({ drive, filepath, expirationMs, contentType }) => {
    try {
      const expiresAt = Date.now() + expirationMs;
      
      // Create a token for upload
      const token = createSecureUrlToken({
        fullFilepath: resolveFilePath(config, serviceName, drive, filepath),
        operation: 'upload',
        expiresAt,
        contentType,
      }, config.secureUrlSecret);

      // Build the secure URL
      const baseUrl = getSecureUrlBaseUrl(config);
      const url = `${baseUrl}/secure-upload?token=${token}`;
      
      console.log(`Generated upload URL for ${filepath} in drive ${drive}, expires at ${new Date(expiresAt).toISOString()}`);
      
      return actionResult(url);
    } catch (error: any) {
      return actionResultError(ErrorTypeEnum.GenericError, `Unable to generate temporary upload secure URL: ${error.message}`);
    }
  };
};

export const getFileGenerateTemporaryUploadSecureUrlActionProcessor = (
  config: FileStorageConfig
): ActionProcessorListResolver => async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [FileActionType.GenerateTemporaryUploadSecureUrl]: getProcessFileGenerateTemporaryUploadSecureUrl(qpqConfig, config),
});