/* eslint-disable @typescript-eslint/no-unused-vars */
import { HTTPEvent } from '../../../../types';
import { toJsonEventResponse } from '../../../../utils/httpEventUtils';
import { askAdminGetLogs } from '../../../../actions';

export function* getLogs(event: HTTPEvent, params: {}) {
  const logs = yield* askAdminGetLogs();

  return toJsonEventResponse(logs);
}
