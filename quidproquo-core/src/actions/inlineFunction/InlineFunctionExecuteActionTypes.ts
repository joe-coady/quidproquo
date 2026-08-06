import { Action } from '../../types/Action';
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
