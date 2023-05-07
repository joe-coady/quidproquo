/* eslint-disable @typescript-eslint/no-unused-vars */
import { HTTPEvent } from '../../../../types';
import { toJsonEventResponse, fromJsonEventRequest } from '../../../../utils/httpEventUtils';
import { askAdminGetLogs } from '../../../../actions';

export interface GetLogsParams {
  nextPageKey?: string;

  startIsoDateTime: string;
  endIsoDateTime: string;
  runtimeType: string;
}

export function* getLogs(event: HTTPEvent, params: {}) {
  const { nextPageKey, startIsoDateTime, endIsoDateTime, runtimeType } =
    fromJsonEventRequest<GetLogsParams>(event);

  const logs = yield* askAdminGetLogs(runtimeType, startIsoDateTime, endIsoDateTime, nextPageKey);

  return toJsonEventResponse(logs);
}
