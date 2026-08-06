import { createActionRequester } from '../../types';
import { UserDirectoryActionType } from './UserDirectoryActionType';
import { AssociateSoftwareTokenResult } from './UserDirectoryAssociateSoftwareTokenActionTypes';

export const askUserDirectoryAssociateSoftwareToken = createActionRequester<AssociateSoftwareTokenResult>()({
  actionType: UserDirectoryActionType.AssociateSoftwareToken,
  getPayload: (userDirectoryName: string, session: string) => ({ userDirectoryName, session }),
});
