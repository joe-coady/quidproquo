import { createErrorEnumForAction } from '../../types';
import { FileActionType } from './FileActionType';
import { FileGenerateTemporarySecureUrlActionRequester } from './FileGenerateTemporarySecureUrlActionTypes';

export const FileGenerateTemporarySecureUrlErrorTypeEnum = createErrorEnumForAction(FileActionType.GenerateTemporarySecureUrl, [
  'ExpirationTooLong', // requested expiry exceeds max length of time possible
  'InvalidScope', // scope is not a valid single path segment
]);

export function* askFileGenerateTemporarySecureUrl(
  drive: string,
  filepath: string,
  expirationMs: number,
  scope?: string,
): FileGenerateTemporarySecureUrlActionRequester {
  return yield {
    type: FileActionType.GenerateTemporarySecureUrl,
    payload: {
      drive,
      filepath,
      expirationMs,
      scope,
    },
  };
}
