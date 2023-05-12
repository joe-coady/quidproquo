import { Action, ActionProcessor, ActionRequester, StoryResultMetadata } from 'quidproquo-core';
import { AdminActionType } from './AdminActionType';

// Payload
export interface AdminGetLogMetadataActionPayload {
  correlationId: string;
}

// Action
export interface AdminGetLogMetadataAction extends Action<AdminGetLogMetadataActionPayload> {
  type: AdminActionType.GetLogMetadata;
  payload: AdminGetLogMetadataActionPayload;
}

// Function Types
export type AdminGetLogMetadataActionProcessor = ActionProcessor<
  AdminGetLogMetadataAction,
  StoryResultMetadata
>;
export type AdminGetLogMetadataActionRequester = ActionRequester<
  AdminGetLogMetadataAction,
  StoryResultMetadata
>;
