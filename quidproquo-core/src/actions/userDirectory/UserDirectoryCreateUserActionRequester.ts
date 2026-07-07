import { createErrorEnumForAction } from '../../types';
import { UserDirectoryActionType } from './UserDirectoryActionType';
import { CreateUserRequest, UserDirectoryCreateUserActionRequester } from './UserDirectoryCreateUserActionTypes';

export const UserDirectoryCreateUserErrorTypeEnum = createErrorEnumForAction(UserDirectoryActionType.CreateUser, [
  'Conflict', // an account with this email already exists
  'InvalidPassword', // the supplied password does not meet the user pool password policy
  'LimitExceeded', // too many create-user attempts; the caller should back off and retry later
]);

export function* askUserDirectoryCreateUser(userDirectoryName: string, createUserRequest: CreateUserRequest): UserDirectoryCreateUserActionRequester {
  return yield {
    type: UserDirectoryActionType.CreateUser,
    payload: {
      userDirectoryName,
      createUserRequest,
    },
  };
}
