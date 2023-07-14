import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { UserDirectoryActionType } from './UserDirectoryActionType';

// Payload
export interface UserDirectoryChangePasswordActionPayload {
  oldPassword: string;
  newPassword: string;
}

// Action
export interface UserDirectoryChangePasswordAction
  extends Action<UserDirectoryChangePasswordActionPayload> {
  type: UserDirectoryActionType.ChangePassword;
  payload: UserDirectoryChangePasswordActionPayload;
}

// Function Types
export type UserDirectoryChangePasswordActionProcessor = ActionProcessor<
  UserDirectoryChangePasswordAction,
  void
>;
export type UserDirectoryChangePasswordActionRequester = ActionRequester<
  UserDirectoryChangePasswordAction,
  void
>;
