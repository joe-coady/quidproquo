import { Action, ActionProcessor, ActionRequester, StoryResultMetadata } from 'quidproquo-core';
import { AdminActionType } from './AdminActionType';

// Payload
export interface AdminGetLogMetadataChildrenActionPayload {
  correlationId: string;
}

// Action
export interface AdminGetLogMetadataChildrenAction
  extends Action<AdminGetLogMetadataChildrenActionPayload> {
  type: AdminActionType.GetLogMetadataChildren;
  payload: AdminGetLogMetadataChildrenActionPayload;
}

// Function Types
export type AdminGetLogMetadataChildrenActionProcessor = ActionProcessor<
  AdminGetLogMetadataChildrenAction,
  StoryResultMetadata[]
>;
export type AdminGetLogMetadataChildrenActionRequester = ActionRequester<
  AdminGetLogMetadataChildrenAction,
  StoryResultMetadata[]
>;
