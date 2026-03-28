import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { InlineFunctionActionType } from './InlineFunctionActionType';

// Payload
export interface InlineFunctionExecuteActionPayload<T> {
  functionName: string;
  payload: T;
}

// Action
export interface InlineFunctionExecuteAction<T> extends Action<InlineFunctionExecuteActionPayload<T>> {
  type: InlineFunctionActionType.Execute;
  payload: InlineFunctionExecuteActionPayload<T>;
}

// Function Types
export type InlineFunctionExecuteActionProcessor<R, T> = ActionProcessor<InlineFunctionExecuteAction<T>, R>;
export type InlineFunctionExecuteActionRequester<R, T> = ActionRequester<InlineFunctionExecuteAction<T>, R>;
