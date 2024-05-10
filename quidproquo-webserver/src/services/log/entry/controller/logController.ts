/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ErrorTypeEnum,
  QpqRuntimeType,
  askThrowError,
  askFileGenerateTemporarySecureUrl,
  AskResponse,
  askConfigGetGlobal,
} from 'quidproquo-core';

import { HTTPEvent, HTTPEventResponse } from '../../../../types';
import { toJsonEventResponse, fromJsonEventRequest } from '../../../../utils/httpEventUtils';
import {
  askGetByCorrelation,
  askGetByFromCorrelation,
  askGetHierarchiesByCorrelation,
} from '../data/logMetadataData';
import { ListLogChatMessages, SendLogChatMessage } from '../domain';
import { askLogSendChatMessage } from '../logic/askLogSendChatMessage';
import { askGetLogChatMessages } from '../logic/askGetLogChatMessages';

import { logsLogic } from '../logic';

export interface GetLogsParams {
  nextPageKey?: string;

  startIsoDateTime: string;
  endIsoDateTime: string;
  runtimeType: QpqRuntimeType;

  infoFilter: string;
  errorFilter: string;
  serviceFilter: string;
}

export function* getLogs(event: HTTPEvent, params: {}): AskResponse<HTTPEventResponse> {
  const {
    nextPageKey,
    startIsoDateTime,
    endIsoDateTime,
    runtimeType,
    errorFilter,
    serviceFilter,
    infoFilter,
  } = fromJsonEventRequest<GetLogsParams>(event);

  const logs = yield* logsLogic.askGetLogs(
    runtimeType,
    startIsoDateTime,
    endIsoDateTime,
    errorFilter,
    serviceFilter,
    infoFilter,
    nextPageKey,
  );

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

export function* getServiceNames(event: HTTPEvent) {
  const serviceNames = yield* askConfigGetGlobal('qpq-serviceNames');

  return toJsonEventResponse(serviceNames);
}

export function* getHierarchies(
  event: HTTPEvent,
  params: {
    correlationId: string;
  },
) {
  const reportUrl = yield* askGetHierarchiesByCorrelation(params.correlationId);

  return toJsonEventResponse({ url: reportUrl });
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

  const message = yield* askLogSendChatMessage(
    sendLogChatMessage.correlationId,
    sendLogChatMessage.message,
  );

  return toJsonEventResponse(message);
}

export function* getChatMessages(event: HTTPEvent) {
  const listLogChatMessages = fromJsonEventRequest<ListLogChatMessages>(event);

  const messages = yield* askGetLogChatMessages(
    listLogChatMessages.correlationId,
    listLogChatMessages.nextPageKey,
  );

  return toJsonEventResponse(messages);
}
