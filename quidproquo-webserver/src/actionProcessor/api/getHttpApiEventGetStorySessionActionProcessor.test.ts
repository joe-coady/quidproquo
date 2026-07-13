import {
  actionResult,
  actionResultError,
  buildActionProcessorList,
  buildTestQpqConfig,
  buildTestStorySession,
  createStreamRegistry,
  createStubLogger,
  ErrorTypeEnum,
  EventActionType,
  noopDynamicModuleLoader,
} from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { RouteAuthValidationActionType } from '../../actions/routeAuthValidation';
import { RouteOptions } from '../../config/settings/route';
import { HTTPEvent } from '../../types/HTTPEvent';
import { getHttpApiEventGetStorySessionActionProcessor } from './getHttpApiEventGetStorySessionActionProcessor';

const qpqConfig = buildTestQpqConfig();

const invoke = async (qpqEventRecord: Partial<HTTPEvent>, config: RouteOptions, processors: Record<string, any> = {}) => {
  const map = await getHttpApiEventGetStorySessionActionProcessor(qpqConfig, noopDynamicModuleLoader);
  const processor = map[EventActionType.GetStorySession];

  return processor(
    { qpqEventRecord, matchStoryResult: { config } },
    buildTestStorySession(),
    buildActionProcessorList(processors),
    createStubLogger(),
    () => {},
    noopDynamicModuleLoader,
    createStreamRegistry(),
  );
};

describe('getHttpApiEventGetStorySessionActionProcessor', () => {
  it('returns an undefined session when there is no access token', async () => {
    const [session] = await invoke({ headers: {} }, {});

    expect(session).toBeUndefined();
  });

  it('attaches the validated token to the session for an authenticated route', async () => {
    const decoded = { wasValid: true, userId: 'u1' };
    const [session] = await invoke(
      { headers: { authorization: 'Bearer token' } },
      { routeAuthSettings: { userDirectoryName: 'users' } },
      { [RouteAuthValidationActionType.Decode]: async () => actionResult(decoded) },
    );

    expect(session.decodedAccessToken).toEqual(decoded);
  });

  it('returns an undefined session when the decode action errors (no identity is attached)', async () => {
    const [session, error] = await invoke(
      { headers: { authorization: 'Bearer token' } },
      { routeAuthSettings: { userDirectoryName: 'users' } },
      { [RouteAuthValidationActionType.Decode]: async () => actionResultError(ErrorTypeEnum.GenericError, 'decode blew up') },
    );

    expect(session).toBeUndefined();
    expect(error).toBeUndefined();
  });

  it('marks an unverified token as wasValid false on an unauthenticated route', async () => {
    // A JWT-shaped token whose payload decodes without any signature check
    const payload = Buffer.from(JSON.stringify({ sub: 'forged-user', exp: 123 }), 'utf-8').toString('base64url');
    const token = `header.${payload}.signature`;

    const [session] = await invoke({ headers: { authorization: `Bearer ${token}` } }, {});

    expect(session.decodedAccessToken.userId).toBe('forged-user');
    expect(session.decodedAccessToken.wasValid).toBe(false);
  });
});
