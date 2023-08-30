import { QpqPagedData } from '../../types';
import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { UserDirectoryActionType, UserAttributes } from './UserDirectoryActionType';

// Payload
export interface UserDirectoryGetUsersActionPayload {
  userDirectoryName: string;
  serviceOverride?: string;
  nextPageKey?: string;
}

// Action
export interface UserDirectoryGetUsersAction
  extends Action<UserDirectoryGetUsersActionPayload> {
  type: UserDirectoryActionType.GetUsers;
  payload: UserDirectoryGetUsersActionPayload;
}

// Function Types
export type UserDirectoryGetUsersActionProcessor = ActionProcessor<
  UserDirectoryGetUsersAction,
  QpqPagedData<UserAttributes>
>;
export type UserDirectoryGetUsersActionRequester = ActionRequester<
  UserDirectoryGetUsersAction,
  QpqPagedData<UserAttributes>
>;
