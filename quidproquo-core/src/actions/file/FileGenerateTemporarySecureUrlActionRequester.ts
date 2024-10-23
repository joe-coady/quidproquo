import { FileActionType } from './FileActionType';
import { FileGenerateTemporarySecureUrlActionRequester } from './FileGenerateTemporarySecureUrlActionTypes';

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
