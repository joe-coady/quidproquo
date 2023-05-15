export interface StoryErrorLog {
  errorType: string;
  errorText: string;
  errorStack?: string;
}

export interface ActionLog {
  type: string;
  payload?: any;
}

export interface ActionHistoryLog {
  act: ActionLog;
  res: any;
  startedAt: string;
  finishedAt: string;
}

export interface StorySessionLog {
  correlation?: string;
  depth: number;
  accessToken?: string;
}

export interface StoryResultLog {
  // Params to story
  input: any;

  // Story Session Data
  session: StorySessionLog;

  // History of actions
  history: ActionHistoryLog[];

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
  result?: any;
  error?: StoryErrorLog;

  // User specified runtime type
  runtimeType: string;
}

export interface StoryResultMetadataLog {
  correlation: string;
  fromCorrelation?: string;

  moduleName: string;
  runtimeType: string;

  startedAt: string;

  generic: string;

  error?: string;
}

export interface QpqLogListLog {
  items: StoryResultMetadataLog[];
  nextPageKey?: string;
}
