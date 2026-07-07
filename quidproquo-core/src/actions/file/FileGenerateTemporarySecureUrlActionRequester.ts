import { createErrorEnumForAction } from '../../types';
import { FileActionType } from './FileActionType';
import { FileGenerateTemporarySecureUrlActionRequester } from './FileGenerateTemporarySecureUrlActionTypes';

export const FileGenerateTemporarySecureUrlErrorTypeEnum = createErrorEnumForAction(FileActionType.GenerateTemporarySecureUrl, [
  'ExpirationTooLong', // requested expiry exceeds max length of time possible
]);

export function* askFileGenerateTemporarySecureUrl(
  drive: string,
  filepath: string,
  expirationMs: number,
): FileGenerateTemporarySecureUrlActionRequester {
  return yield {
    type: FileActionType.GenerateTemporarySecureUrl,
    payload: {
      drive,
      filepath,
      expirationMs,
    },
  };
}
