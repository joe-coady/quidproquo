import { AnyAuthChallenge, AskResponse, AuthenticateUserChallenge } from 'quidproquo-core';

// TODO: Fix this import (name it up the chain)
import { qpqWebServerUtils } from '../../../../index';
import { HTTPEvent, HTTPEventResponse } from '../../../../types';
import { authLogic } from '../../logic';
import {
  AnyChallengePayload,
  ChangePasswordPayload,
  ConfirmForgotPasswordPayload,
  ForgotPasswordPayload,
  isMfaChallengePayload,
  isNewPasswordChallengePayload,
  LoginPayload,
  RefreshPayload,
} from '../../types';

// Maps the wire payload (discriminated by `challenge`) onto the core auth
// challenge shape. The type guards narrow `payload`, so no manual casts are
// needed. Add a branch here as new challenge types are supported.
const challengePayloadToAuthChallenge = (payload: AnyChallengePayload): AnyAuthChallenge => {
  if (isNewPasswordChallengePayload(payload)) {
    return {
      challenge: AuthenticateUserChallenge.NEW_PASSWORD_REQUIRED,
      username: payload.email,
      session: payload.session,
      newPassword: payload.newPassword,
    };
  }

  if (isMfaChallengePayload(payload)) {
    return {
      challenge: AuthenticateUserChallenge.SOFTWARE_TOKEN_MFA,
      username: payload.email,
      session: payload.session,
      mfaCode: payload.mfaCode,
    };
  }

  throw new Error(`Unsupported auth challenge: ${(payload as AnyChallengePayload).challenge}`);
};

export function* login(event: HTTPEvent): AskResponse<HTTPEventResponse> {
  const { username, password } = yield* qpqWebServerUtils.askFromJsonEventRequest<LoginPayload>(event);

  const authResponse = yield* authLogic.askLogin(username, password);

  return qpqWebServerUtils.toJsonEventResponse(authResponse);
}

export function* refreshToken(event: HTTPEvent): AskResponse<HTTPEventResponse> {
  const { refreshToken } = yield* qpqWebServerUtils.askFromJsonEventRequest<RefreshPayload>(event);

  const refreshResponse = yield* authLogic.askRefreshToken(refreshToken);

  return qpqWebServerUtils.toJsonEventResponse(refreshResponse);
}

export function* respondToAuthChallenge(event: HTTPEvent): AskResponse<HTTPEventResponse> {
  const payload = yield* qpqWebServerUtils.askFromJsonEventRequest<AnyChallengePayload>(event);

  const response = yield* authLogic.askRespondToAuthChallenge(challengePayloadToAuthChallenge(payload));

  return qpqWebServerUtils.toJsonEventResponse(response);
}

export function* forgotPassword(event: HTTPEvent): AskResponse<HTTPEventResponse> {
  const { username } = yield* qpqWebServerUtils.askFromJsonEventRequest<ForgotPasswordPayload>(event);

  const deliveryDetails = yield* authLogic.askForgotPassword(username);

  return qpqWebServerUtils.toJsonEventResponse(deliveryDetails);
}

export function* confirmForgotPassword(event: HTTPEvent): AskResponse<HTTPEventResponse> {
  const { username, code, password } = yield* qpqWebServerUtils.askFromJsonEventRequest<ConfirmForgotPasswordPayload>(event);

  const response = yield* authLogic.askConfirmForgotPassword(username, code, password);

  return qpqWebServerUtils.toJsonEventResponse(response);
}

export function* changePassword(event: HTTPEvent): AskResponse<HTTPEventResponse> {
  const { oldPassword, newPassword } = yield* qpqWebServerUtils.askFromJsonEventRequest<ChangePasswordPayload>(event);

  // The route is authenticated, so the access token is present on the request.
  const accessToken = qpqWebServerUtils.getAccessTokenFromHeaders(event.headers) || '';

  yield* authLogic.askChangePassword(oldPassword, newPassword, accessToken);

  return qpqWebServerUtils.toJsonEventResponse({ success: true });
}
