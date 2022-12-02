import { PlatformActionType } from './PlatformActionType';
import { Action, ActionProcessor, ActionRequester } from '../../types/Action';

// Payload
export interface PlatformDelayActionPayload {
  timeMs: number;
}

// Action
export interface PlatformDelayAction extends Action<PlatformDelayActionPayload> {
  type: PlatformActionType.Delay;
  payload: PlatformDelayActionPayload;
}

// Functions
export type PlatformDelayActionProcessor = ActionProcessor<PlatformDelayAction, void>;
export type PlatformDelayActionRequester = ActionRequester<PlatformDelayAction, void>;
