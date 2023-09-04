import { QpqContext } from '../../types';
import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { ContextActionType } from './ContextActionType';

// Payload
export interface ContextListActionPayload {}

// Action
export interface ContextListAction extends Action<ContextListActionPayload> {
  type: ContextActionType.List;
}

// Function Types
export type ContextListActionProcessor = ActionProcessor<ContextListAction, QpqContext<any>>;
export type ContextListActionRequester = ActionRequester<ContextListAction, QpqContext<any>>;
