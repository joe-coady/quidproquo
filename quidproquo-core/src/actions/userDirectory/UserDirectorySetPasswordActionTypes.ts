import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { UserDirectoryActionType } from './UserDirectoryActionType';

// Payload
export interface UserDirectorySetPasswordActionPayload {
  userDirectoryName: string;
  username: string;
  newPassword: string;
}

// Action
export interface UserDirectorySetPasswordAction extends Action<UserDirectorySetPasswordActionPayload> {
  type: UserDirectoryActionType.SetPassword;
  payload: UserDirectorySetPasswordActionPayload;
}

// Function Types
export type UserDirectorySetPasswordActionProcessor = ActionProcessor<UserDirectorySetPasswordAction, void>;
export type UserDirectorySetPasswordActionRequester = ActionRequester<UserDirectorySetPasswordAction, void>;
