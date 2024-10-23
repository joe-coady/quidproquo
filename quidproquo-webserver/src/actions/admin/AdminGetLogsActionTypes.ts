import { Action, ActionProcessor, ActionRequester, StoryResultMetadata } from 'quidproquo-core';

import { AdminActionType, QpqLogList } from './AdminActionType';

// Payload
export interface AdminGetLogsActionPayload {
  runtimeType: string;
  nextPageKey?: string;

  startIsoDateTime: string;
  endIsoDateTime: string;
}

// Action
export interface AdminGetLogsAction extends Action<AdminGetLogsActionPayload> {
  type: AdminActionType.GetLogs;
  payload: AdminGetLogsActionPayload;
}

// Function Types
export type AdminGetLogsActionProcessor = ActionProcessor<AdminGetLogsAction, QpqLogList>;
export type AdminGetLogsActionRequester = ActionRequester<AdminGetLogsAction, QpqLogList>;
