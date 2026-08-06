import { AdminActionType, QpqLogList } from './AdminActionType';

// Payload
export interface AdminGetLogMetadataChildrenActionPayload {
  correlationId: string;

  nextPageKey?: string;
}
