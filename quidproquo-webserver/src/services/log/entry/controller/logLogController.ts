import { AskResponse, LogLevelEnum } from 'quidproquo-core';

import { HTTPEvent, HTTPEventResponse } from '../../../../types';
import { askFromJsonEventRequest, toJsonEventResponse } from '../../../../utils/httpEventUtils';
import { logLogLogic } from '../../logic/logLog';

export interface GetLogLogSearchParams {
  logLevel: LogLevelEnum;

  startIsoDateTime: string;
  endIsoDateTime: string;

  msgFilter: string;
  serviceFilter: string;

  nextPageKey?: string;
}

export function* getLogLogs(event: HTTPEvent, params: {}): AskResponse<HTTPEventResponse> {
  const { nextPageKey, logLevel, startIsoDateTime, endIsoDateTime, serviceFilter, msgFilter } =
    yield* askFromJsonEventRequest<GetLogLogSearchParams>(event);

  const logs = yield* logLogLogic.askGetLogLogs(logLevel, startIsoDateTime, endIsoDateTime, serviceFilter, msgFilter, nextPageKey);

  return toJsonEventResponse(logs);
}
