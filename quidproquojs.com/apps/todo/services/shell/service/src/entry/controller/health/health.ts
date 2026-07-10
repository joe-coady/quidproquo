import {
  askDateNow,
  AskResponse,
  HTTPEvent,
  HTTPEventResponse,
  qpqWebServerUtils,
} from 'quidproquo';
import { dynamicRoute } from 'quidproquo-features';

export const health = dynamicRoute(
  ['GET', '/health'],
  function* healthCheck(event: HTTPEvent): AskResponse<HTTPEventResponse> {
    const checkedAt = yield* askDateNow();

    return qpqWebServerUtils.toJsonEventResponse({
      status: 'healthy',
      service: 'shell',
      checkedAt,
    });
  }
);
