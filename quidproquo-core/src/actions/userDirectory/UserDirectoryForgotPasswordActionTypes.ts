import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { AuthenticationDeliveryDetails, UserDirectoryActionType } from './UserDirectoryActionType';

// Payload
export interface UserDirectoryForgotPasswordActionPayload {
  userDirectoryName: string;

  username: string;
}

// Action
export interface UserDirectoryForgotPasswordAction extends Action<UserDirectoryForgotPasswordActionPayload> {
  type: UserDirectoryActionType.ForgotPassword;
  payload: UserDirectoryForgotPasswordActionPayload;
}

// Function Types
export type UserDirectoryForgotPasswordActionProcessor = ActionProcessor<UserDirectoryForgotPasswordAction, AuthenticationDeliveryDetails>;
export type UserDirectoryForgotPasswordActionRequester = ActionRequester<UserDirectoryForgotPasswordAction, AuthenticationDeliveryDetails>;
