import { QpqPagedData } from '../../types';
import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { UserDirectoryActionType, UserAttributes } from './UserDirectoryActionType';

// Payload
export interface UserDirectoryGetUsersByAttributeActionPayload {
  userDirectoryName: string;

  attribueName: keyof UserAttributes;
  attribueValue: string;
  limit?: number;

  nextPageKey?: string;
}

// Action
export interface UserDirectoryGetUsersByAttributeAction extends Action<UserDirectoryGetUsersByAttributeActionPayload> {
  type: UserDirectoryActionType.GetUsersByAttribute;
  payload: UserDirectoryGetUsersByAttributeActionPayload;
}

// Function Types
export type UserDirectoryGetUsersByAttributeActionProcessor = ActionProcessor<UserDirectoryGetUsersByAttributeAction, QpqPagedData<UserAttributes>>;
export type UserDirectoryGetUsersByAttributeActionRequester = ActionRequester<UserDirectoryGetUsersByAttributeAction, QpqPagedData<UserAttributes>>;
