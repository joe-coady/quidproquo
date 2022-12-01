import { GuidActionType } from './GuidActionType';
import { Action, ActionProcessor, ActionRequester } from '../../types/Action';

// Payload
export interface GuidNewActionPayload {}

// Action
export interface GuidNewAction extends Action<GuidNewActionPayload> {
  type: GuidActionType.New;
}

// Function Types
export type GuidNewActionProcessor = ActionProcessor<GuidNewAction, string>;
export type GuidNewActionRequester = ActionRequester<GuidNewAction, string>;
