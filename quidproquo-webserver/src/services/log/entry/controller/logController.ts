import {
  askConfigGetGlobal,
  askFileGenerateTemporarySecureUrl,
  askFileIsColdStorage,
  AskResponse,
  askThrowError,
  ErrorTypeEnum,
  QpqRuntimeType,
} from 'quidproquo-core';

import { HTTPEvent, HTTPEventResponse } from '../../../../types';
import { askFromJsonEventRequest, toJsonEventResponse } from '../../../../utils/httpEventUtils';
import { logsLogic } from '../../logic';
import { askGetLogChatMessages } from '../../logic/askGetLogChatMessages';
import { askLogSendChatMessage } from '../../logic/askLogSendChatMessage';
import { askToggleLogChecked } from '../../logic/logs';
import { askGetByCorrelation, askGetByFromCorrelation, askGetHierarchiesByCorrelation } from '../data/logMetadataData';
import { ListLogChatMessages, SendLogChatMessage } from '../domain';

export interface GetLogsParams {
  nextPageKey?: string;

  startIsoDateTime: string;
  endIsoDateTime: string;
  runtimeType: QpqRuntimeType;

  infoFilter: string;
  errorFilter: string;
  serviceFilter: string;
  userFilter: string;
  deep: string;
  onlyErrors: boolean;
}

export function* getLogs(event: HTTPEvent, params: {}): AskResponse<HTTPEventResponse> {
  const { nextPageKey, startIsoDateTime, endIsoDateTime, runtimeType, errorFilter, serviceFilter, infoFilter, userFilter, onlyErrors, deep } =
    yield* askFromJsonEventRequest<GetLogsParams>(event);

  const logs = yield* logsLogic.askGetLogs(
    runtimeType,
    startIsoDateTime,
    endIsoDateTime,
    errorFilter,
    serviceFilter,
    infoFilter,
    userFilter,
    deep,
    onlyErrors,
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

export function* toggleLogCheck(
  event: HTTPEvent,
  params: {
    correlationId: string;
  },
) {
  const log = yield* askToggleLogChecked(params.correlationId, false);

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
  const reportUrl = yield* askGetHierarchiesByCorrelation(params.correlationId, event.query.refresh === 'true');

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
  const isColdStorageg = yield* askFileIsColdStorage('qpq-logs', `${params.correlationId}.json`);

  if (!isColdStorageg) {
    const url = yield* askFileGenerateTemporarySecureUrl('qpq-logs', `${params.correlationId}.json`, 1 * 60 * 1000);

    return toJsonEventResponse({ url, isColdStorage: false });
  }

  return toJsonEventResponse({ url: '', isColdStorage: true });
}

export function* sendChatMessage(event: HTTPEvent) {
  const sendLogChatMessage = yield* askFromJsonEventRequest<SendLogChatMessage>(event);

  const message = yield* askLogSendChatMessage(sendLogChatMessage.correlationId, sendLogChatMessage.message);

  return toJsonEventResponse(message);
}

export function* getChatMessages(event: HTTPEvent) {
  const listLogChatMessages = yield* askFromJsonEventRequest<ListLogChatMessages>(event);

  const messages = yield* askGetLogChatMessages(listLogChatMessages.correlationId, listLogChatMessages.nextPageKey);

  return toJsonEventResponse(messages);
}
