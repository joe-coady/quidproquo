/* eslint-disable @typescript-eslint/no-unused-vars */
import { ErrorTypeEnum, QpqRuntimeType, askThrowError } from 'quidproquo-core';

import { HTTPEvent } from '../../../../types';
import { toJsonEventResponse, fromJsonEventRequest } from '../../../../utils/httpEventUtils';
import { askListLogs, askGetByCorrelation, askGetByFromCorrelation } from '../data/logMetadataData';
import * as logData from '../data/logData';

export interface GetLogsParams {
  nextPageKey?: string;

  startIsoDateTime: string;
  endIsoDateTime: string;
  runtimeType: QpqRuntimeType;
}

export function* getLogs(event: HTTPEvent, params: {}) {
  const { nextPageKey, startIsoDateTime, endIsoDateTime, runtimeType } = fromJsonEventRequest<GetLogsParams>(event);

  const logs = yield* askListLogs(runtimeType, startIsoDateTime, endIsoDateTime, nextPageKey);

  return toJsonEventResponse(logs);
}

export function* getLog(
  event: HTTPEvent,
  params: {
    correlationId: string;
  },
) {
  const log = yield* askGetByCorrelation(params.correlationId);
  if (!log) {
    yield* askThrowError(ErrorTypeEnum.NotFound, 'Log not found');
  }

  return toJsonEventResponse(log);
}

export function* getChildren(
  event: HTTPEvent,
  params: {
    fromCorrelation: string;
  },
) {
  const log = yield* askGetByFromCorrelation(params.fromCorrelation);

  return toJsonEventResponse(log);
}

export function* downloadLog(
  event: HTTPEvent,
  params: {
    correlationId: string;
  },
) {
  const log = yield* logData.askGetByCorrelation(params.correlationId);

  return toJsonEventResponse(log);
}
