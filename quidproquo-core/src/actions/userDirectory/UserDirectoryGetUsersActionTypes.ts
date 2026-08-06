import { QpqPagedData } from '../../types';
import { UserAttributes, UserDirectoryActionType } from './UserDirectoryActionType';

// Payload
export interface UserDirectoryGetUsersActionPayload {
  userDirectoryName: string;
  nextPageKey?: string;
}
