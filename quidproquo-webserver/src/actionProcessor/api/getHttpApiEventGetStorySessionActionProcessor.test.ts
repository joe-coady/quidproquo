import {
  actionResult,
  buildActionProcessorList,
  buildTestQpqConfig,
  buildTestStorySession,
  createStreamRegistry,
  createStubLogger,
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
});
