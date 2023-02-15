import {
  UserDirectoryAuthenticateUserActionRequester,
  UserDirectoryAuthenticateUserActionPayload,
} from './UserDirectoryAuthenticateUserActionTypes';
import { UserDirectoryActionType } from './UserDirectoryActionType';

export function* askUserDirectoryAuthenticateUser(
  options: UserDirectoryAuthenticateUserActionPayload,
): UserDirectoryAuthenticateUserActionRequester {
  return yield { type: UserDirectoryActionType.AuthenticateUser, payload: options };
}
