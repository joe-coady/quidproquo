import { StoryResultMetadata } from 'quidproquo-core';
import { LogLog } from 'quidproquo-webserver';

import { LogChatMessage } from '../types/LogChatMessage';

// Server-derived / transient data that is NOT part of the audited session fold.
// Search results are a cache keyed by the raw search params that produced them
// (the request intent lives in the session fold; the response payload lives
// here). Searches fan out one part per runtime type / log level, so progress is
// partsDone / partsTotal.
export type VolatileLogResults = {
  logs: StoryResultMetadata[];
  partsTotal: number;
  partsDone: number;
  isSearching: boolean;
  fetchedAt: string | null;
};

export type VolatileLogLogResults = {
  logLogs: LogLog[];
  partsTotal: number;
  partsDone: number;
  isSearching: boolean;
  fetchedAt: string | null;
};

export type VolatileChat = {
  messages: LogChatMessage[];
  nextPageKey?: string;
  pendingReplies: number;
};

export type VolatileState = {
  logResults: Record<string, VolatileLogResults>;
  logLogResults: Record<string, VolatileLogLogResults>;
  chatByCorrelation: Record<string, VolatileChat>;
  realtimeErrorLogs: StoryResultMetadata[];
  serviceNames: string[];
};

export const createInitialVolatileState = (): VolatileState => ({
  logResults: {},
  logLogResults: {},
  chatByCorrelation: {},
  realtimeErrorLogs: [],
  serviceNames: [],
});
