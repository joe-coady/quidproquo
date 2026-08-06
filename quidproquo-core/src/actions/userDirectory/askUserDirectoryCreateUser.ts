import { createActionRequester } from '../../types';
import { AuthenticateUserResponse, UserDirectoryActionType } from './UserDirectoryActionType';
import { CreateUserRequest } from './UserDirectoryCreateUserActionTypes';

export const askUserDirectoryCreateUser = createActionRequester<AuthenticateUserResponse>()({
  actionType: UserDirectoryActionType.CreateUser,
  errorTypes: [
    'Conflict', // an account with this email already exists
    'InvalidPassword', // the supplied password does not meet the user pool password policy
    'LimitExceeded', // too many create-user attempts; the caller should back off and retry later
  ],
  getPayload: (userDirectoryName: string, createUserRequest: CreateUserRequest) => ({ userDirectoryName, createUserRequest }),
});
