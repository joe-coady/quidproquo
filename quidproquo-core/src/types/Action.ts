import { QPQError } from './ErrorTypeEnum';
import { StorySession } from './StorySession';

// Action ~ Think redux action
// They must have a type, and an optional payload
export interface Action<T> {
  type: string;
  payload?: T;
}

// Result tuple ~ Either result or error
export type ActionProcessorResult<T> = [T?, QPQError?];

// A function type ~ Processes an action and returns an ActionProcessorResult
export type ActionProcessor<
  TAction extends Action<any>,
  TReturn = any,
  TActionPayload = TAction['payload'],
> = (payload: TActionPayload, session: StorySession) => Promise<ActionProcessorResult<TReturn>>;

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
