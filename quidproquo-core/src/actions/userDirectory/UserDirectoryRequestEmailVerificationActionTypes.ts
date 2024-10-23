import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { AuthenticationDeliveryDetails,UserDirectoryActionType } from './UserDirectoryActionType';

// Payload
export interface UserDirectoryRequestEmailVerificationActionPayload {
  userDirectoryName: string;

  accessToken: string;
}

// Action
export interface UserDirectoryRequestEmailVerificationAction extends Action<UserDirectoryRequestEmailVerificationActionPayload> {
  type: UserDirectoryActionType.RequestEmailVerification;
  payload: UserDirectoryRequestEmailVerificationActionPayload;
}

// Function Types
export type UserDirectoryRequestEmailVerificationActionProcessor = ActionProcessor<
  UserDirectoryRequestEmailVerificationAction,
  AuthenticationDeliveryDetails
>;
export type UserDirectoryRequestEmailVerificationActionRequester = ActionRequester<
  UserDirectoryRequestEmailVerificationAction,
  AuthenticationDeliveryDetails
>;
