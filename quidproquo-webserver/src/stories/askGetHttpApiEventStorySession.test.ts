import { runStory, StorySession } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { RouteAuthValidationActionType } from '../actions/routeAuthValidation';
import { HTTPEvent } from '../types/HTTPEvent';
import { askGetHttpApiEventStorySession } from './askGetHttpApiEventStorySession';

const session = { correlation: 'corr', depth: 0, context: {} } as StorySession;

const encodeJwt = (payload: object): string => {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
  return `header.${body}.signature`;
};

const buildEvent = (headers: Record<string, string> = {}) => ({ headers }) as unknown as HTTPEvent;

describe('askGetHttpApiEventStorySession', () => {
  it('returns undefined when there is no access token', () => {
    expect(runStory(askGetHttpApiEventStorySession({ event: buildEvent(), session }))).toBeUndefined();
  });

  it('decodes the token for logging only when the route has no user directory', () => {
    const token = encodeJwt({ sub: 'u1', username: 'alice', exp: 99 });
    const result = runStory(askGetHttpApiEventStorySession({ event: buildEvent({ authorization: `Bearer ${token}` }), session }));

    expect(result?.decodedAccessToken).toEqual({
      exp: 99,
      userDirectory: '',
      userId: 'u1',
      username: 'alice',
      wasValid: false,
    });
  });

  it('returns undefined when an authenticated route fails to decode', () => {
    const result = runStory(
      askGetHttpApiEventStorySession({
        event: buildEvent({ authorization: 'Bearer token' }),
        routeAuthSettings: { userDirectoryName: 'users' },
        session,
      }),
      { [RouteAuthValidationActionType.Decode]: null },
    );

    expect(result).toBeUndefined();
  });

  it('attaches the validated token to the session for an authenticated route', () => {
    const decoded = { wasValid: true, userId: 'u1' };
    const result = runStory(
      askGetHttpApiEventStorySession({
        event: buildEvent({ authorization: 'Bearer token' }),
        routeAuthSettings: { userDirectoryName: 'users' },
        session,
      }),
      { [RouteAuthValidationActionType.Decode]: decoded },
    );

    expect(result?.decodedAccessToken).toEqual(decoded);
  });
});
