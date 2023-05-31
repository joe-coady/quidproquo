/* eslint-disable @typescript-eslint/no-unused-vars */
import { HTTPEvent } from '../../../../types';
import { toJsonEventResponse, fromJsonEventRequest } from '../../../../utils/httpEventUtils';
import {
  askAdminGetLogs,
  askAdminGetLog,
  askAdminGetLogMetadata,
  askAdminGetLogMetadataChildren,
} from '../../../../actions';

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

export function* getLog(
  event: HTTPEvent,
  params: {
    correlationId: string;
  },
) {
  const log = yield* askAdminGetLog(params.correlationId);

  return toJsonEventResponse(log);
}

export function* getLogMetadata(
  event: HTTPEvent,
  params: {
    correlationId: string;
  },
) {
  const log = yield* askAdminGetLogMetadata(params.correlationId);

  return toJsonEventResponse(log);
}

export function* getLogMetadataChildren(
  event: HTTPEvent,
  params: {
    correlationId: string;
  },
) {
  const log = yield* askAdminGetLogMetadataChildren(params.correlationId);

  return toJsonEventResponse(log);
}
