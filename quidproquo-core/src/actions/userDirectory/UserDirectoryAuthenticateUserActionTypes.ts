import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { UserDirectoryActionType } from './UserDirectoryActionType';

// Payload
export interface UserDirectoryAuthenticateUserActionPayload {
  userDirectoryName: string;

  username: string;
  password: string;
}

// Action
export interface UserDirectoryAuthenticateUserAction
  extends Action<UserDirectoryAuthenticateUserActionPayload> {
  type: UserDirectoryActionType.AuthenticateUser;
  payload: UserDirectoryAuthenticateUserActionPayload;
}

// Function Types
export type UserDirectoryAuthenticateUserActionProcessor = ActionProcessor<
  UserDirectoryAuthenticateUserAction,
  string
>;
export type UserDirectoryAuthenticateUserActionRequester = ActionRequester<
  UserDirectoryAuthenticateUserAction,
  string
>;
