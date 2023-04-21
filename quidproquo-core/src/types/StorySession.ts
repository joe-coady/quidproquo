import { ErrorTypeEnum } from './ErrorTypeEnum';
import { Action } from './Action';

export interface StorySession {
  correlation?: string;
}

export interface StoryError {
  errorType: ErrorTypeEnum;
  errorText: string;
  errorStack?: string;
}

export type AskResponse<T> = Generator<any, T, any>;

export interface ActionHistory<T = any> {
  act: Action<T>;
  res: any;
  startedAt: string;
  finishedAt: string;
}

export enum QpqRuntimeType {
  API = 'API',
  EXECUTE_STORY = 'EXECUTE_STORY',
  EVENT_BRIDGE_EVENT = 'EVENT_BRIDGE_EVENT',
  QUEUE_EVENT = 'QUEUE_EVENT',
  EVENT_SEO_OR = 'EVENT_SEO_OR',
  SERVICE_FUNCTION_EXE = 'SERVICE_FUNCTION_EXE',
}

export interface StoryResult<TArgs extends Array<any>, TResult = any> {
  // Params to story
  input: TArgs;

  // Story Session Data (mutates over time)
  session: StorySession;

  // History of actions
  history: ActionHistory[];

  // When the story started / finished
  startedAt: string;
  finishedAt?: string;

  // correlationGuid from the calling story
  fromCorrelation?: string;

  // correlation for this story (correlates all actions together)
  correlation: string;

  // Result of the story result or error not both
  result?: TResult;
  error?: StoryError;

  // User specified runtime type
  runtimeType: QpqRuntimeType;
}
