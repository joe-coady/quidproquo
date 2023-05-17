import { AnyAuthChallenge } from './types';
import { Action, ActionProcessor, ActionRequester } from '../../types';
import { UserDirectoryActionType, AuthenticationDeliveryDetails } from './UserDirectoryActionType';

// Payload
export interface UserDirectoryRespondToAuthChallengeActionPayload {
  userDirectoryName: string;

  authChallenge: AnyAuthChallenge;
}

// Action
export interface UserDirectoryRespondToAuthChallengeAction
  extends Action<UserDirectoryRespondToAuthChallengeActionPayload> {
  type: UserDirectoryActionType.RespondToAuthChallenge;
  payload: UserDirectoryRespondToAuthChallengeActionPayload;
}

// Function Types
export type UserDirectoryRespondToAuthChallengeActionProcessor = ActionProcessor<
  UserDirectoryRespondToAuthChallengeAction,
  AuthenticationDeliveryDetails
>;
export type UserDirectoryRespondToAuthChallengeActionRequester = ActionRequester<
  UserDirectoryRespondToAuthChallengeAction,
  AuthenticationDeliveryDetails
>;
