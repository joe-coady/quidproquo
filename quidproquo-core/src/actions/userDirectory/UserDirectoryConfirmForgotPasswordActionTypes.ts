import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { UserDirectoryActionType, AuthenticateUserResponse } from './UserDirectoryActionType';

// Payload
export interface UserDirectoryConfirmForgotPasswordActionPayload {
  userDirectoryName: string;

  code: string;
  username: string;
  password: string;
}

// Action
export interface UserDirectoryConfirmForgotPasswordAction
  extends Action<UserDirectoryConfirmForgotPasswordActionPayload> {
  type: UserDirectoryActionType.ConfirmForgotPassword;
  payload: UserDirectoryConfirmForgotPasswordActionPayload;
}

// Function Types
export type UserDirectoryConfirmForgotPasswordActionProcessor = ActionProcessor<
  UserDirectoryConfirmForgotPasswordAction,
  AuthenticateUserResponse
>;
export type UserDirectoryConfirmForgotPasswordActionRequester = ActionRequester<
  UserDirectoryConfirmForgotPasswordAction,
  AuthenticateUserResponse
>;
