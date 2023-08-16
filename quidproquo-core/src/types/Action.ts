import { QPQError } from './ErrorTypeEnum';
import { StoryResult, StorySession } from './StorySession';

// Action ~ Think redux action
// They must have a type, and an optional payload
export interface Action<T> {
  type: string;
  payload?: T;
  
  returnErrors?: boolean;
}

// Result tuple ~ Either result or error
export type ActionProcessorResult<T> = [T?, QPQError?];

// Action result ~ Either result or error
export type EitherActionResult<T> =
  | {
      success: true;
      result: T;
      error?: never;
    }
  | {
      success: false;
      result?: never;
      error: QPQError;
    };

// A function type ~ Processes an action and returns an ActionProcessorResult
export type ActionProcessor<
  TAction extends Action<any>,
  TReturn = any,
  TActionPayload = TAction['payload'],
> = (
  payload: TActionPayload,
  session: StorySession,
  actionProcessors: ActionProcessorList,
  logger: (result: StoryResult<any>) => Promise<void>,
) => Promise<ActionProcessorResult<TReturn>>;

// Generator<
//  Thing you are giving to QPQ,
//  Thing the function returns to the regular logic,
//  the thing QPQ gives us
// >
export type ActionRequester<
  TAction extends Action<any>,
  TReturn = undefined,
  TQPQReturn = TReturn,
> = Generator<TAction, TReturn, TQPQReturn>;

export type ActionProcessorList = {
  [key: string]: ActionProcessor<any, any, any>;
};
