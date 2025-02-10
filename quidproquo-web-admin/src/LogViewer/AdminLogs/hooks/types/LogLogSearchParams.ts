import { LogLevelEnumLookup } from 'quidproquo-core';

export interface LogLogSearchParams {
  logLevelLookup: LogLevelEnumLookup;

  serviceFilter: string;

  startIsoDateTime: string;
  endIsoDateTime: string;

  reasonFilter: string;

  nextPageKey?: string;
}
