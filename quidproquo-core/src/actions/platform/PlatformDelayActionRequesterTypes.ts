import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { PlatformActionType } from './PlatformActionType';

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
