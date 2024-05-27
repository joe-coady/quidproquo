export enum EventActionType {
  GetRecords = '@quidproquo-core/Event/GetRecords',
  TransformEventRecord = '@quidproquo-core/event/TransformEventRecord',
  TransformEventRecordResponse = '@quidproquo-core/event/TransformEventRecordResponse',
  MatchStory = '@quidproquo-core/event/MatchStory',

  TransformEventParams = '@quidproquo-core/event/TransformEventParams',
  TransformResponseResult = '@quidproquo-core/event/TransformResponseResult',
  AutoRespond = '@quidproquo-core/event/AutoRespond',
  ResolveCaughtError = '@quidproquo-core/event/ResolveCaughtError',
}

export type MatchStoryResult<MatchOptions, Config> = {
  src?: string;
  runtime?: string;
  runtimeOptions?: MatchOptions;
  config?: Config;
};

export type AnyMatchStoryResult = MatchStoryResult<any, any>;
