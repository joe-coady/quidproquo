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
export type ActionProcessor<TPayload, TReturn> = (
  payload: TPayload,
  session: StorySession,
) => Promise<ActionProcessorResult<TReturn>>;
