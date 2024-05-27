export enum EventActionType {
  TransformEventParams = '@quidproquo-core/event/TransformEventParams',
  TransformResponseResult = '@quidproquo-core/event/TransformResponseResult',
  AutoRespond = '@quidproquo-core/event/AutoRespond',
  MatchStory = '@quidproquo-core/event/MatchStory',
  ResolveCaughtError = '@quidproquo-core/event/ResolveCaughtError',
}

export type MatchStoryResult<MatchOptions, Config> = {
  src?: string;
  runtime?: string;
  runtimeOptions?: MatchOptions;
  config?: Config;
};

export type AnyMatchStoryResult = MatchStoryResult<any, any>;
