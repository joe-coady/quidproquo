import { LogLevelEnum } from 'quidproquo-core';

export type LogLog = {
  type: LogLevelEnum;
  timestamp: string;

  reason: string;

  fromCorrelation?: string;
  ttl?: number;
};
