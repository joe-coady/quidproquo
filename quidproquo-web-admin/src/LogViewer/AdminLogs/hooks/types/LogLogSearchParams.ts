import { LogLevelEnumLookup } from 'quidproquo-core';

export interface LogLogSearchParams {
  logLevelLookup: LogLevelEnumLookup;

  serviceFilter: string;

  startIsoDateTime: string;
  endIsoDateTime: string;

  msgFilter: string;

  nextPageKey?: string;
}
