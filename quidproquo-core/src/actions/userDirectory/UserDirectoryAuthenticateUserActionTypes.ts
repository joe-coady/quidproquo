import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { ErrorThrowErrorAction } from '../error/ErrorThrowErrorActionRequesterTypes';
import { AuthenticateUserResponse, UserDirectoryActionType } from './UserDirectoryActionType';

export type AuthenticateUserRequest = {
  email: string;
} & (
  | {
      [key: string]: any;
      isCustom: true;
    }
  | {
      password: string;
      isCustom: false;
    }
);

// Payload
export type UserDirectoryAuthenticateUserActionPayload = {
  userDirectoryName: string;
  authenticateUserRequest: AuthenticateUserRequest;
};

// Action
export interface UserDirectoryAuthenticateUserAction extends Action<UserDirectoryAuthenticateUserActionPayload> {
  type: UserDirectoryActionType.AuthenticateUser;
  payload: UserDirectoryAuthenticateUserActionPayload;
}

// Function Types
export type UserDirectoryAuthenticateUserActionProcessor = ActionProcessor<UserDirectoryAuthenticateUserAction, AuthenticateUserResponse>;
// The requester can also yield a ThrowError action: a standard (non custom) sign-in
// with no password is rejected in the requester before it ever reaches a processor.
export type UserDirectoryAuthenticateUserActionRequester = ActionRequester<
  UserDirectoryAuthenticateUserAction | ErrorThrowErrorAction,
  AuthenticateUserResponse
>;
