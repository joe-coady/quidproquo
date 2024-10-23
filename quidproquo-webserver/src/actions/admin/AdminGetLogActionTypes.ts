import { Action, ActionProcessor, ActionRequester, StoryResult } from 'quidproquo-core';

import { AdminActionType } from './AdminActionType';

// Payload
export interface AdminGetLogActionPayload {
  correlationId: string;
}

// Action
export interface AdminGetLogAction extends Action<AdminGetLogActionPayload> {
  type: AdminActionType.GetLog;
  payload: AdminGetLogActionPayload;
}

// Function Types
export type AdminGetLogActionProcessor = ActionProcessor<AdminGetLogAction, StoryResult<any>>;
export type AdminGetLogActionRequester = ActionRequester<AdminGetLogAction, StoryResult<any>>;
