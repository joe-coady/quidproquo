import { Action, ActionProcessor, ActionRequester } from 'quidproquo-core';
import { WebEntryActionType } from './WebEntryActionType';

// Payload
export interface WebEntryInvalidateCacheActionPayload {
  webEntryName: string;
  paths: string[];
}

// Action
export interface WebEntryInvalidateCacheAction extends Action<WebEntryInvalidateCacheActionPayload> {
  type: WebEntryActionType.InvalidateCache;
  payload: WebEntryInvalidateCacheActionPayload;
}

// Function Types
export type WebEntryInvalidateCacheActionProcessor = ActionProcessor<WebEntryInvalidateCacheAction, void>;
export type WebEntryInvalidateCacheActionRequester = ActionRequester<WebEntryInvalidateCacheAction, void>;
