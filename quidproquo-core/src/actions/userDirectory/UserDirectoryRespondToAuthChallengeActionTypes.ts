import { Action, ActionProcessor, ActionRequester } from '../../types';
import { AnyAuthChallenge } from './types';
import { AuthenticateUserResponse, UserDirectoryActionType } from './UserDirectoryActionType';

// Payload
export interface UserDirectoryRespondToAuthChallengeActionPayload {
  userDirectoryName: string;

  authChallenge: AnyAuthChallenge;
}
