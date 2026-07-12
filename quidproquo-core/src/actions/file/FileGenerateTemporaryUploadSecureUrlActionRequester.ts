import { createErrorEnumForAction } from '../../types';
import { FileActionType } from './FileActionType';
import {
  FileGenerateTemporaryUploadSecureUrlActionPayload,
  FileGenerateTemporaryUploadSecureUrlActionRequester,
} from './FileGenerateTemporaryUploadSecureUrlActionTypes';

export const FileGenerateTemporaryUploadSecureUrlErrorTypeEnum = createErrorEnumForAction(FileActionType.GenerateTemporaryUploadSecureUrl, [
  'ExpirationTooLong', // requested expiry exceeds max length of time possible
  'InvalidScope', // scope is not a valid single path segment
]);

export function* askFileGenerateTemporaryUploadSecureUrl(
  drive: string,
  filepath: string,
  expirationMs: number,
  advancedOptions?: {
    contentType?: FileGenerateTemporaryUploadSecureUrlActionPayload['contentType'];
    // maxSizeBytes?: FileGenerateTemporaryUploadSecureUrlActionPayload['maxSizeBytes']
  },
  scope?: string,
): FileGenerateTemporaryUploadSecureUrlActionRequester {
  return yield {
    type: FileActionType.GenerateTemporaryUploadSecureUrl,
    payload: {
      drive,
      filepath,
      expirationMs,
      contentType: advancedOptions?.contentType,
      // maxSizeBytes: advancedOptions?.maxSizeBytes,
      scope,
    },
  };
}
