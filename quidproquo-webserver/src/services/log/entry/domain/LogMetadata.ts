// import { QpqRuntimeType } from "quidproquo-core";

import { QpqRuntimeType } from "quidproquo-core";

export interface LogMetadata {
  correlation: string;
  fromCorrelation?: string;

  moduleName: string;
  runtimeType: QpqRuntimeType;

  startedAt: string;

  generic: string;

  error?: string;

  executionTimeMs: number;

  ttl?: number;
}
  