import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { UserDirectoryActionType } from './UserDirectoryActionType';

// Payload
export interface UserDirectorySignOutUserActionPayload {
  accessToken: string;
}

// Action
export interface UserDirectorySignOutUserAction extends Action<UserDirectorySignOutUserActionPayload> {
  type: UserDirectoryActionType.SignOutUser;
  payload: UserDirectorySignOutUserActionPayload;
}

// Function Types
export type UserDirectorySignOutUserActionProcessor = ActionProcessor<UserDirectorySignOutUserAction, void>;
export type UserDirectorySignOutUserActionRequester = ActionRequester<UserDirectorySignOutUserAction, void>;
