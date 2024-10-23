import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { GuidActionType } from './GuidActionType';

// Payload
export type GuidNewActionPayload = undefined;

// Action
export interface GuidNewAction extends Action<GuidNewActionPayload> {
  type: GuidActionType.New;
}

// Function Types
export type GuidNewActionProcessor = ActionProcessor<GuidNewAction, string>;
export type GuidNewActionRequester = ActionRequester<GuidNewAction, string>;
