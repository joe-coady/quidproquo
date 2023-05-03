import { Action, ActionProcessor, ActionRequester, StoryResultMetadata } from 'quidproquo-core';
import { AdminActionType } from './AdminActionType';

// Payload
export interface AdminGetLogsActionPayload {}

// Action
export interface AdminGetLogsAction extends Action<AdminGetLogsActionPayload> {
  type: AdminActionType.GetLogs;
  payload: AdminGetLogsActionPayload;
}

// Function Types
export type AdminGetLogsActionProcessor = ActionProcessor<
  AdminGetLogsAction,
  StoryResultMetadata[]
>;
export type AdminGetLogsActionRequester = ActionRequester<
  AdminGetLogsAction,
  StoryResultMetadata[]
>;
