import { AnyAuthChallenge } from './types';
import { Action, ActionProcessor, ActionRequester } from '../../types';
import { UserDirectoryActionType, AuthenticateUserResponse } from './UserDirectoryActionType';

// Payload
export interface UserDirectoryRespondToAuthChallengeActionPayload {
  userDirectoryName: string;

  authChallenge: AnyAuthChallenge;
}

// Action
export interface UserDirectoryRespondToAuthChallengeAction extends Action<UserDirectoryRespondToAuthChallengeActionPayload> {
  type: UserDirectoryActionType.RespondToAuthChallenge;
  payload: UserDirectoryRespondToAuthChallengeActionPayload;
}

// Function Types
export type UserDirectoryRespondToAuthChallengeActionProcessor = ActionProcessor<UserDirectoryRespondToAuthChallengeAction, AuthenticateUserResponse>;
export type UserDirectoryRespondToAuthChallengeActionRequester = ActionRequester<UserDirectoryRespondToAuthChallengeAction, AuthenticateUserResponse>;
