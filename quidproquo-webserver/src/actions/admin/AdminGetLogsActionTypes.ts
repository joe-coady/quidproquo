import { Action, ActionProcessor, ActionRequester, StoryResult } from 'quidproquo-core';
import { AdminActionType } from './AdminActionType';

// Payload
export interface AdminGetLogsActionPayload {}

// Action
export interface AdminGetLogsAction extends Action<AdminGetLogsActionPayload> {
  type: AdminActionType.GetLogs;
  payload: AdminGetLogsActionPayload;
}

// Function Types
export type AdminGetLogsActionProcessor = ActionProcessor<AdminGetLogsAction, StoryResult<any>[]>;
export type AdminGetLogsActionRequester = ActionRequester<AdminGetLogsAction, StoryResult<any>[]>;
