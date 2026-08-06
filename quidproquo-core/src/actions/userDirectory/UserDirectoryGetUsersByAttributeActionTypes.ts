import { QpqPagedData } from '../../types';
import { UserAttributes, UserDirectoryActionType } from './UserDirectoryActionType';

// Payload
export interface UserDirectoryGetUsersByAttributeActionPayload {
  userDirectoryName: string;

  attribueName: keyof UserAttributes;
  attribueValue: string;
  limit?: number;

  nextPageKey?: string;
}
