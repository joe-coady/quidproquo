import { AdminActionType, QpqLogList } from './AdminActionType';

// Payload
export interface AdminGetLogsActionPayload {
  runtimeType: string;
  nextPageKey?: string;

  startIsoDateTime: string;
  endIsoDateTime: string;
}
