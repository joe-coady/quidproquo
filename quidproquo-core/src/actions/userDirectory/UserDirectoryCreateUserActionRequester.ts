import { UserDirectoryActionType } from './UserDirectoryActionType';
import { CreateUserRequest, UserDirectoryCreateUserActionRequester } from './UserDirectoryCreateUserActionTypes';

export function* askUserDirectoryCreateUser(userDirectoryName: string, createUserRequest: CreateUserRequest): UserDirectoryCreateUserActionRequester {
  return yield {
    type: UserDirectoryActionType.CreateUser,
    payload: {
      userDirectoryName,
      createUserRequest,
    },
  };
}
