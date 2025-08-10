import { FileActionType } from './FileActionType';
import { FileGenerateTemporaryUploadSecureUrlActionPayload, FileGenerateTemporaryUploadSecureUrlActionRequester } from './FileGenerateTemporaryUploadSecureUrlActionTypes';

export function* askFileGenerateTemporaryUploadSecureUrl(
  drive: string,
  filepath: string,
  expirationMs: number,
  advancedOptions?: {
    contentType?: FileGenerateTemporaryUploadSecureUrlActionPayload['contentType'],
    // maxSizeBytes?: FileGenerateTemporaryUploadSecureUrlActionPayload['maxSizeBytes']
  }
): FileGenerateTemporaryUploadSecureUrlActionRequester {
  return yield {
    type: FileActionType.GenerateTemporaryUploadSecureUrl,
    payload: {
      drive,
      filepath,
      expirationMs,
      contentType: advancedOptions?.contentType,
      // maxSizeBytes: advancedOptions?.maxSizeBytes,
    },
  };
}
