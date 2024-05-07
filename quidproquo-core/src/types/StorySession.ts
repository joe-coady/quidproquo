import { ErrorTypeEnum } from './ErrorTypeEnum';
import { Action } from './Action';
import { QpqContext } from './QpqContextIdentifier';

export interface StorySession {
  correlation?: string;
  depth: number;

  // TODO: We will probably want to think about if we want this
  // how we deal with refreshing it
  // maybe storing a userid is better after we validate it
  // but what if a event 3 weeks from now is run, but the user is deleted, but now
  // still has access ?

  // Decoded access token + roles token
  accessToken?: string;

  // Context
  context: QpqContext<any>;
}

export type StorySessionUpdater = (newSession: Partial<StorySession>) => void;

export interface StoryError {
  errorType: ErrorTypeEnum;
  errorText: string;
  errorStack?: string;
}

export type AskResponse<T> = Generator<Action<any>, T, any>;

/**
 * Utility Type: ExtractGeneratorReturnType
 *
 * This utility type is designed to extract the return type of a Generator without
 * conflating it with the types of values it may yield. Generators in TypeScript are
 * annotated as Generator<YieldType, ReturnType, NextType>, where YieldType is the
 * type of values yielded by the generator, ReturnType is the type the generator returns
 * when it's done, and NextType is the type of the value passed to the generator's `next` method.
 *
 * By leveraging TypeScript's conditional types and the `infer` keyword, ExtractGeneratorReturnType
 * can precisely capture and extract just the ReturnType of any given Generator, providing a clean,
 * type-safe way to understand what a generator ultimately returns upon completion.
 *
 * Usage of `infer` in Conditional Types:
 * The `infer` keyword is used here to declare a type variable R within the conditional type
 * expression. TypeScript will then infer the type R as the generator's ReturnType when the
 * condition `T extends Generator<any, infer R, any>` is met. This inference is based on the
 * actual type passed to ExtractGeneratorReturnType, allowing us to "pull out" the ReturnType
 * from within the Generator type.
 *
 * This approach is particularly useful because it directly targets the ReturnType without
 * having to manually sift through or exclude the types of values that might be yielded by
 * the generator, which can often be diverse and not relevant to the final return type we're
 * interested in capturing.
 *
 * The ExtractGeneratorReturnType utility type simplifies the extraction process and ensures
 * that types dependent on the return value of generators are accurately typed, enhancing
 * code readability and maintainability.
 */

export type ExtractGeneratorReturnType<T extends Generator> = T extends Generator<any, infer R, any>
  ? R
  : never;

// Directly extracting the generator's return type for any given AskResponse.
// By applying ExtractGeneratorReturnType to an AskResponse, we can determine the
// precise type that the AskResponse generator returns, bypassing the complexities
// of its yield types. This is particularly useful in scenarios where the return type
// is distinct from the types of actions or values yielded by the generator, allowing
// for clear type inference and usage in TypeScript codebases.
export type AskResponseReturnType<T extends AskResponse<any>> = ExtractGeneratorReturnType<T>;

// Any generator function that returns an AskResponse
// qpq runtimes are built on stories
export type qpqStory = <T = any>(...args: any[]) => AskResponse<T>;

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
  SEND_EMAIL_EVENT = 'SEND_EMAIL_EVENT',
  WEBSOCKET_EVENT = 'WEBSOCKET_EVENT',
  DEPLOY_EVENT = 'DEPLOY_EVENT',
  STORAGEDRIVE_EVENT = 'STORAGEDRIVE_EVENT',
  CLOUD_FLARE_DEPLOY = 'CLOUD_FLARE_DEPLOY',
  UNIT_TEST = 'UNIT_TEST',
}

export interface qpqConsoleLog {
  t: string;
  a: any[];
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
  finishedAt: string;

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

  // Impure Logs
  logs?: qpqConsoleLog[];
}

export interface StoryResultMetadata {
  correlation: string;
  fromCorrelation?: string;

  moduleName: string;
  runtimeType: QpqRuntimeType;

  startedAt: string;

  generic: string;

  error?: string;

  executionTimeMs: number;
}

export type StoryResultMetadataWithChildren = StoryResultMetadata & {
  children: StoryResultMetadataWithChildren[];
};
