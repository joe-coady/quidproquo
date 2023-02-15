import {
  UserDirectoryCreateUserActionRequester,
  CreateUserRequest,
} from './UserDirectoryCreateUserActionTypes';
import { UserDirectoryActionType } from './UserDirectoryActionType';

export function* askUserDirectoryCreateUser(
  userDirectoryName: string,
  createUserRequest: CreateUserRequest,
): UserDirectoryCreateUserActionRequester {
  return yield {
    type: UserDirectoryActionType.CreateUser,
    payload: {
      userDirectoryName,
      createUserRequest,
    },
  };
}
