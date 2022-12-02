import { SystemActionType } from './SystemActionType';
import { Action, ActionRequester, ActionProcessor } from '../../types/Action';

// Payload
export interface SystemExecuteStoryActionPayload<T extends Array<any>> {
  type: string;
  src: string;
  runtime: string;
  params: T;
}

// Action
export interface SystemExecuteStoryAction<T extends Array<any>>
  extends Action<SystemExecuteStoryActionPayload<T>> {
  type: SystemActionType.ExecuteStory;
  payload: SystemExecuteStoryActionPayload<T>;
}

// Functions
export type SystemExecuteStoryActionProcessor<T extends Array<any>> = ActionProcessor<
  SystemExecuteStoryAction<T>,
  any
>;
export type SystemExecuteStoryActionRequester<T extends Array<any>> = ActionRequester<
  SystemExecuteStoryAction<T>,
  any
>;
