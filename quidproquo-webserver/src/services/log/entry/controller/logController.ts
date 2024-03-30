/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ErrorTypeEnum,
  QpqRuntimeType,
  askThrowError,
  askFileGenerateTemporarySecureUrl,
  askDateNow,
  askDelay,
} from 'quidproquo-core';

import { HTTPEvent } from '../../../../types';
import { toJsonEventResponse, fromJsonEventRequest } from '../../../../utils/httpEventUtils';
import { askListLogs, askGetByCorrelation, askGetByFromCorrelation } from '../data/logMetadataData';
import { LogChatMessage, SendLogChatMessage } from '../domain';

export interface GetLogsParams {
  nextPageKey?: string;

  startIsoDateTime: string;
  endIsoDateTime: string;
  runtimeType: QpqRuntimeType;
}

export function* getLogs(event: HTTPEvent, params: {}) {
  const { nextPageKey, startIsoDateTime, endIsoDateTime, runtimeType } =
    fromJsonEventRequest<GetLogsParams>(event);

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

export function* downloadUrl(
  event: HTTPEvent,
  params: {
    correlationId: string;
  },
) {
  const url = yield* askFileGenerateTemporarySecureUrl(
    'qpq-logs',
    `${params.correlationId}.json`,
    1 * 60 * 1000,
  );

  return toJsonEventResponse({ url });
}

export function* sendChatMessage(event: HTTPEvent) {
  const sendLogChatMessage = fromJsonEventRequest<SendLogChatMessage>(event);

  const response: LogChatMessage = {
    isAi: true,
    message: `<p>You said: "${sendLogChatMessage.message}". I'm just a mock response for now!</p>`,
    timestamp: yield* askDateNow(),
  };

  yield* askDelay(2000);

  return toJsonEventResponse(response);
}
