import { AskResponse } from 'quidproquo-core';
import {
  HTTPEvent,
  HTTPEventResponse
} from '../../../../types';

// TODO: Fix this import (name it up the chain)
import { qpqWebServerUtils } from "../../../../index"

import * as authLogic from '../logic/auth';

export type LoginPayload = {
    username: string;
    password: string;
};

export type RefreshPayload = {
    refreshToken: string;
};

export function* login(event: HTTPEvent): AskResponse<HTTPEventResponse> {
  const { username, password } = qpqWebServerUtils.fromJsonEventRequest<LoginPayload>(event);

  const authResponse = yield* authLogic.askLogin( username, password );

  return qpqWebServerUtils.toJsonEventResponse(authResponse);
}

export function* refreshToken(
  event: HTTPEvent
): AskResponse<HTTPEventResponse> {
  const { refreshToken } = qpqWebServerUtils.fromJsonEventRequest<RefreshPayload>(event);

  const refreshResponse = yield* authLogic.askRefreshToken(
    refreshToken
  );

  return qpqWebServerUtils.toJsonEventResponse(refreshResponse);
}
