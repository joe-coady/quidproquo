import { UserDirectoryActionType } from './UserDirectoryActionType';
import { UserDirectoryAssociateSoftwareTokenActionRequester } from './UserDirectoryAssociateSoftwareTokenActionTypes';

export function* askUserDirectoryAssociateSoftwareToken(
  userDirectoryName: string,
  session: string,
): UserDirectoryAssociateSoftwareTokenActionRequester {
  return yield {
    type: UserDirectoryActionType.AssociateSoftwareToken,
    payload: {
      userDirectoryName,

      session,
    },
  };
}
