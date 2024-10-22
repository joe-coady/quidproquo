import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { UserDirectoryActionType, AuthenticationDeliveryDetails } from './UserDirectoryActionType';

// Payload
export interface UserDirectoryConfirmEmailVerificationActionPayload {
  code: string;
  accessToken: string;
}

// Action
export interface UserDirectoryConfirmEmailVerificationAction extends Action<UserDirectoryConfirmEmailVerificationActionPayload> {
  type: UserDirectoryActionType.ConfirmEmailVerification;
  payload: UserDirectoryConfirmEmailVerificationActionPayload;
}

// Function Types
export type UserDirectoryConfirmEmailVerificationActionProcessor = ActionProcessor<UserDirectoryConfirmEmailVerificationAction, void>;
export type UserDirectoryConfirmEmailVerificationActionRequester = ActionRequester<UserDirectoryConfirmEmailVerificationAction, void>;
