import {
  UserDirectoryCreateUserActionRequester,
  UserDirectoryCreateUserActionPayload,
} from './UserDirectoryCreateUserActionTypes';
import { UserDirectoryActionType } from './UserDirectoryActionType';

export function* askUserDirectoryCreateUser(
  options: UserDirectoryCreateUserActionPayload,
): UserDirectoryCreateUserActionRequester {
  return yield { type: UserDirectoryActionType.CreateUser, payload: options };
}
