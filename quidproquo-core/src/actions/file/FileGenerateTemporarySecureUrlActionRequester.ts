import { FileGenerateTemporarySecureUrlActionRequester } from './FileGenerateTemporarySecureUrlActionTypes';
import { FileActionType } from './FileActionType';

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
