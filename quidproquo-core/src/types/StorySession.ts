import { ErrorTypeEnum } from './ErrorTypeEnum';
import { Action } from './Action';

export interface StorySession {
  correlation?: string;
  depth: number;

  // TODO: We will probably want to think about if we want this
  // how we deal with refreshing it
  // maybe storing a userid is better after we validate it
  // but what if a event 3 weeks from now is run, but the user is deleted, but now
  // still has access ?
  accessToken?: string;
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
  RECURRING_SCHEDULE = 'RECURRING_SCHEDULE',
  QUEUE_EVENT = 'QUEUE_EVENT',
  EVENT_SEO_OR = 'EVENT_SEO_OR',
  SERVICE_FUNCTION_EXE = 'SERVICE_FUNCTION_EXE',
}

export interface StoryResult<TArgs extends Array<any>, TResult = any> {
  // Params to story
  input: TArgs;

  // Story Session Data
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

  // For logging, tags to help identify the story
  tags: string[];
  moduleName: string;

  // Result of the story result or error not both
  result?: TResult;
  error?: StoryError;

  // User specified runtime type
  runtimeType: QpqRuntimeType;
}

export interface StoryResultMetadata {
  correlation: string;
  fromCorrelation?: string;

  moduleName: string;
  runtimeType: QpqRuntimeType;

  startedAt: string;

  generic: string;

  error?: string;
}
