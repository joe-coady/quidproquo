import { Action, ActionProcessor, ActionRequester, StoryResultMetadata } from 'quidproquo-core';
import { AdminActionType, QpqLogList } from './AdminActionType';

// Payload
export interface AdminGetLogMetadataChildrenActionPayload {
  correlationId: string;

  nextPageKey?: string;
}

// Action
export interface AdminGetLogMetadataChildrenAction extends Action<AdminGetLogMetadataChildrenActionPayload> {
  type: AdminActionType.GetLogMetadataChildren;
  payload: AdminGetLogMetadataChildrenActionPayload;
}

// Function Types
export type AdminGetLogMetadataChildrenActionProcessor = ActionProcessor<AdminGetLogMetadataChildrenAction, QpqLogList>;
export type AdminGetLogMetadataChildrenActionRequester = ActionRequester<AdminGetLogMetadataChildrenAction, QpqLogList>;
